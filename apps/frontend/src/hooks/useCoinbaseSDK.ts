// apps/frontend/src/hooks/useCoinbaseSDK.ts
import { useState, useEffect } from 'react';
import CoinbaseSDK from '@coinbase/wallet-sdk';
import { useToast } from '@chakra-ui/react';

interface CoinbaseConfig {
  appName: string;
  appLogoUrl: string;
  darkMode: boolean;
}

export const useCoinbaseSDK = (config: CoinbaseConfig) => {
  const [sdk, setSDK] = useState<CoinbaseSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const initSDK = async () => {
      try {
        const coinbaseSDK = new CoinbaseSDK({
          appName: config.appName,
          appLogoUrl: config.appLogoUrl,
          darkMode: config.darkMode,
        });
        
        setSDK(coinbaseSDK);
      } catch (error: unknown) {
        toast({
          title: 'Failed to initialize Coinbase SDK',
          description: (error instanceof Error) ? error.message : 'An unknown error occurred',
          status: 'error',
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    initSDK();
  }, [config, toast]);

  return { sdk, loading };
};
