// context/ToastContext.tsx
import React, { createContext, useCallback } from 'react';
import {
  useToast as useChakraToast,
  UseToastOptions,
  Box,
  HStack,
  Icon,
  Text,
  Progress,
} from '@chakra-ui/react';
import {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Loader,
} from 'lucide-react';

interface TransactionToastOptions {
  hash?: string;
  description?: string;
  chainId?: string | number;
}

interface ToastContextValue {
  success: (message: string, options?: UseToastOptions) => void;
  error: (message: string, options?: UseToastOptions) => void;
  info: (message: string, options?: UseToastOptions) => void;
  warning: (message: string, options?: UseToastOptions) => void;
  loading: (message: string, options?: UseToastOptions) => void;
  transaction: {
    pending: (message: string, options?: TransactionToastOptions) => void;
    success: (message: string, options?: TransactionToastOptions) => void;
    error: (message: string, options?: TransactionToastOptions) => void;
  };
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_TOAST_OPTIONS: UseToastOptions = {
  position: 'bottom-right',
  duration: 5000,
  isClosable: true,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useChakraToast();

  const getExplorerLink = (hash: string, chainId: string | number = 'testnet') => {
    return `https://explore${chainId === 'mainnet' ? '' : '-testnet'}.vechain.org/transactions/${hash}`;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createToastContent = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' | 'loading',
    options?: TransactionToastOptions
  ) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      info: Info,
      warning: AlertTriangle,
      loading: Loader,
    };

    const IconComponent = icons[type];

    return (
      <Box>
        <HStack spacing={3}>
          <Icon
            as={IconComponent}
            boxSize={5}
            className={type === 'loading' ? 'animate-spin' : ''}
          />
          <Box flex="1">
            <Text fontWeight="medium">{message}</Text>
            {options?.description && (
              <Text fontSize="sm" opacity={0.8}>
                {options.description}
              </Text>
            )}
            {options?.hash && (
              <Text
                fontSize="sm"
                color="blue.500"
                as="a"
                href={getExplorerLink(options.hash, options.chainId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer →
              </Text>
            )}
          </Box>
        </HStack>
        {type === 'loading' && (
          <Progress
            size="xs"
            isIndeterminate
            colorScheme="blue"
            mt={2}
          />
        )}
      </Box>
    );
  };

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' | 'loading',
      options?: UseToastOptions & TransactionToastOptions
    ) => {
      const toastOptions: UseToastOptions = {
        ...DEFAULT_TOAST_OPTIONS,
        ...options,
        render: () => createToastContent(message, type, options),
      };

      if (type === 'loading') {
        toastOptions.duration = null;
      }

      return toast(toastOptions);
    },
    [createToastContent, toast]
  );

  const success = useCallback(
    (message: string, options?: UseToastOptions) => 
      showToast(message, 'success', { ...options, description: options?.description as string }),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: UseToastOptions) => 
      showToast(message, 'error', { ...options, description: options?.description as string }),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: UseToastOptions) => 
      showToast(message, 'info', { ...options, description: options?.description as string }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: UseToastOptions) => 
      showToast(message, 'warning', { ...options, description: options?.description as string }),
    [showToast]
  );

  const loading = useCallback(
    (message: string, options?: UseToastOptions) => 
      showToast(message, 'loading', { ...options, description: options?.description as string }),
    [showToast]
  );

  const transaction = {
    pending: useCallback(
      (message: string, options?: TransactionToastOptions) =>
        showToast(
          message,
          'loading',
          {
            description: 'Transaction pending...',
            ...options,
          }
        ),
      [showToast]
    ),
    success: useCallback(
      (message: string, options?: TransactionToastOptions) =>
        showToast(
          message,
          'success',
          {
            description: 'Transaction confirmed',
            ...options,
          }
        ),
      [showToast]
    ),
    error: useCallback(
      (message: string, options?: TransactionToastOptions) =>
        showToast(
          message,
          'error',
          {
            description: 'Transaction failed',
            ...options,
          }
        ),
      [showToast]
    ),
  };

  const clear = useCallback(() => {
    toast.closeAll();
  }, [toast]);

  return (
    <ToastContext.Provider
      value={{
        success,
        error,
        info,
        warning,
        loading,
        transaction,
        clear,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};