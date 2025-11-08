import { Injectable } from '@nestjs/common';
import { HTTP_STATUS, MESSAGE_STATUS, RPC_URL } from './app.const';

interface BlockResult {
  transactions: any[];
}

interface SolanaRpcResponse {
  jsonrpc: string;
  id: number;
  result?: BlockResult;
  error?: {
    code: number;
    message: string;
  };
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getTransactionsFromBlock(blockId: string): Promise<any> {
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
          return {
            status: HTTP_STATUS.NOT_FOUND,
            message: MESSAGE_STATUS.BLOCK_NOT_EXIST,
          };
        }
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      return {
        status: HTTP_STATUS.OK,
        message: MESSAGE_STATUS.SUCCESS,
        data: {
          txs_count: data.result?.transactions?.length || 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch transactions from block: ${(error as Error).message}`,
      );
    }
  }
}
