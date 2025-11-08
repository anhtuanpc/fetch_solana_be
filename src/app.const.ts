export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const MESSAGE_STATUS = {
  SUCCESS: 'Success',
  BLOCK_NOT_EXIST: 'Block does not exist',
  INVALID_BLOCK_ID: 'Invalid block ID. Must be a valid number.',
};

export const RPC_URL = 'https://api.mainnet-beta.solana.com';

export interface BlockResult {
  transactions: unknown[];
}

export interface SolanaRpcResponse {
  jsonrpc: string;
  id: number;
  result?: BlockResult;
  error?: {
    code: number;
    message: string;
  };
}

export interface TransactionResponse {
  status: number;
  message: string;
  data?: {
    transactionCount: number;
  };
}
