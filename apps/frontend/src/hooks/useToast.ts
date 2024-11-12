// hooks/useToast.ts
import { useCallback } from 'react';
import { UseToastOptions, useToast as useChakraToast } from '@chakra-ui/react';

interface ToastOptions extends Omit<UseToastOptions, 'status'> {
  description?: string;
}

export const useToast = () => {
  const toast = useChakraToast();

  const success = useCallback((title: string, options?: ToastOptions) => {
    toast({
      title,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
      ...options,
    });
  }, [toast]);

  const error = useCallback((title: string, options?: ToastOptions) => {
    toast({
      title,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
      ...options,
    });
  }, [toast]);

  const warning = useCallback((title: string, options?: ToastOptions) => {
    toast({
      title,
      status: 'warning',
      duration: 4000,
      isClosable: true,
      position: 'top',
      ...options,
    });
  }, [toast]);

  const info = useCallback((title: string, options?: ToastOptions) => {
    toast({
      title,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
      ...options,
    });
  }, [toast]);

  return { success, error, warning, info };
};
