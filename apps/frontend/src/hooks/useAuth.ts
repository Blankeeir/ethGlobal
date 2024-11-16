// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useToast } from '@chakra-ui/react';

export const useAuth = () => {
  const { user, isAuthenticated, showAuthFlow } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const login = async () => {
    setIsLoading(true);
    try {
      await showAuthFlow();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to authenticate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session
    if (!isAuthenticated && localStorage.getItem('dynamic_auth_token')) {
      login();
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login
  };
};