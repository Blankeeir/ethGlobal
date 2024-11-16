// hooks/useTransactions.ts
import { useCallback } from 'react';
import { useToast } from './useToast';
import type { TransactionConfig as Web3TransactionConfig } from 'web3-core';

interface TransactionConfig extends Web3TransactionConfig {
  send: () => Promise<unknown>;
}

interface TransactionOptions {
  pendingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTransactions = () => {
  const toast = useToast();

  const handleTransaction = useCallback(async (
    transaction: TransactionConfig,
    options: TransactionOptions = {}
  ) => {
    const {
      pendingMessage = 'Transaction pending...',
      successMessage = 'Transaction successful!',
      errorMessage = 'Transaction failed',
      onSuccess,
      onError,
    } = options;

    try {
      if (pendingMessage) {
        toast.info(pendingMessage, { duration: null });
      }

      const receipt = await (transaction.send as () => Promise<unknown>)();

      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.();
      return receipt;
    } catch (error: unknown) {
      const message = (error as Error).message;
      toast.error(errorMessage, { description: message });
      onError?.(error as Error);
      throw error;
    }
  }, [toast]);

  return { handleTransaction };
};