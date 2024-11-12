// apps/frontend/src/auth/DynamicAuthProvider.tsx
import React from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

const evmNetworks = [{
    blockExplorerUrls: ['https://explore-testnet.vechain.org'],
    chainId: 92, // Changed from '0x5c' to 92
    chainName: 'VeChain Testnet',
    name: 'VeChain Testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'VET',
      symbol: 'VET',
    },
    networkId: 1,
    iconUrls: ['/vechain-logo.svg', 'https://app.dynamic.xyz/assets/networks/eth.svg'],
    // networkType: 'testnet',
    rpcUrls: [import.meta.env.VITE_VECHAIN_NODE_URL],
    vanityName: 'VECHAIN_TESTNET'
}];

interface DynamicAuthProviderProps {
  children: React.ReactNode;
}

export const DynamicAuthProvider: React.FC<DynamicAuthProviderProps> = ({ children }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '714fe82f-7dd8-4c30-848b-28c05ad0788e',
        walletConnectors: [EthereumWalletConnectors],
        // overrides: { evmNetworks }
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};
