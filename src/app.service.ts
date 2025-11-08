import { Injectable } from '@nestjs/common';
import {
  HTTP_STATUS,
  MESSAGE_STATUS,
  RPC_URL,
  SolanaRpcResponse,
  TransactionResponse,
} from './app.const';

@Injectable()
export class AppService {
  private cache: Map<string, { data: TransactionResponse; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 60000; // 60 seconds

  getHello(): string {
    return 'Hello World!';
  }

  async getTransactionsFromBlock(
    blockId: string,
  ): Promise<TransactionResponse> {
    if (!blockId || !/^\d+$/.test(blockId)) {
      return {
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGE_STATUS.INVALID_BLOCK_ID,
      };
    }

    // Check cache
    const cached = this.cache.get(blockId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBlock',
      params: [
        parseInt(blockId),
        {
          encoding: 'json',
          transactionDetails: 'full',
          maxSupportedTransactionVersion: 0,
        },
      ],
    };

    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as SolanaRpcResponse;

      if (data.error) {
        if (data.error.message.includes('Block not available for slot')) {
          const errorResponse = {
            status: HTTP_STATUS.NOT_FOUND,
            message: MESSAGE_STATUS.BLOCK_NOT_EXIST,
          };
          // Cache error response
          this.cache.set(blockId, {
            data: errorResponse,
            timestamp: Date.now(),
          });
          return errorResponse;
        }
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      const successResponse = {
        status: HTTP_STATUS.OK,
        message: MESSAGE_STATUS.SUCCESS,
        data: {
          transactionCount: data.result?.transactions?.length || 0,
        },
      };

      // Cache successful response
      this.cache.set(blockId, {
        data: successResponse,
        timestamp: Date.now(),
      });

      return successResponse;
    } catch (error) {
      throw new Error(
        `Failed to fetch transactions from block: ${(error as Error).message}`,
      );
    }
  }
}
