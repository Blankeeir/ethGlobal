// src/contexts/WorldIDContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface WorldIDContextType {
  verifyIdentity: () => Promise<boolean>;
}

const WorldIDContext = createContext<WorldIDContextType | undefined>(undefined);

export const WorldIDProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  const verifyIdentity = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      // Trigger authentication flow
      // Assuming useAuth provides a login method
      await login();
    }
    // Implement World ID verification logic here
    // This is a placeholder; replace with actual verification process
    return isAuthenticated;
  };

  return (
    <WorldIDContext.Provider value={{ verifyIdentity }}>
      {children}
    </WorldIDContext.Provider>
  );
};

export const useWorldID = (): WorldIDContextType => {
  const context = useContext(WorldIDContext);
  if (!context) {
    throw new Error('useWorldID must be used within a WorldIDProvider');
  }
  return context;
};



async function login(): Promise<void> {
    try {
        // Integrate with your authentication service here
        // For example, using a web3 wallet connection:
        const provider = await detectEthereumProvider();
        if (!provider) {
            throw new Error('Please install MetaMask or another web3 wallet');
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}
interface EthereumProvider {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    providers?: EthereumProvider[];
}

async function detectEthereumProvider(): Promise<EthereumProvider | null> {
    if (window.ethereum) {
        return window.ethereum;
    }

    // Check if multiple wallets are installed
    const providers = window.ethereum?.providers;
    if (providers) {
        // Prefer MetaMask if available
        const metaMaskProvider = providers.find((p: EthereumProvider) => p.isMetaMask);
        if (metaMaskProvider) return metaMaskProvider;
        
        // Otherwise return the first available provider
        return providers[0];
    }

    return null;
}
