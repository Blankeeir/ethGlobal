// src/contexts/ENSContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';

interface ENSContextType {
  resolveName: (name: string) => Promise<string | null>;
  lookupAddress: (address: string) => Promise<string | null>;
}

const ENSContext = createContext<ENSContextType | undefined>(undefined);

export const ENSProvider = ({ children }: { children: ReactNode }) => {
  const { provider } = useWeb3();
const [ens, setEns] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (provider) {
      setEns(provider.getResolver());
    }
  }, [provider]);

  const resolveName = async (name: string): Promise<string | null> => {
    if (!ens) return null;
    try {
      const address = await ens.resolveName(name);
      return address;
    } catch (error) {
      console.error('Error resolving ENS name:', error);
      return null;
    }
  };

  const lookupAddress = async (address: string): Promise<string | null> => {
    if (!ens) return null;
    try {
      const name = await ens.lookupAddress(address);
      return name;
    } catch (error) {
      console.error('Error looking up ENS address:', error);
      return null;
    }
  };

  return (
    <ENSContext.Provider value={{ resolveName, lookupAddress }}>
      {children}
    </ENSContext.Provider>
  );
};

export const useENS = (): ENSContextType => {
  const context = useContext(ENSContext);
  if (!context) {
    throw new Error('useENS must be used within an ENSProvider');
  }
  return context;
};
