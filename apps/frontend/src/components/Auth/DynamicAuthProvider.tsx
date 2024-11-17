// src/components/Auth/DynamicAuthProvider.tsx

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';

interface DynamicAuthContextType {
  isAuthenticated: boolean;
  walletAddress: string | null;
  openWidget: () => void;
  // Optionally, add a logout function if needed
  logout: () => void;
}

export const DynamicAuthContext = createContext<DynamicAuthContextType | null>(null);

export const DynamicAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const openWidget = () => {
    setIsWidgetOpen(true);
  };

  const closeWidget = () => {
    setIsWidgetOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('dynamic_auth_token');
    localStorage.removeItem('wallet_address');
    setIsAuthenticated(false);
    setWalletAddress(null);
  };

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const authToken = localStorage.getItem('dynamic_auth_token');
      const address = localStorage.getItem('wallet_address');
      setIsAuthenticated(!!authToken);
      setWalletAddress(address || null);
    };
    checkAuth();
  }, []);

  // Handle authentication events
  useEffect(() => {
    const handleAuthSuccess = (event: any) => {
      const { authToken, address } = event.detail;
      if (authToken && address) {
        localStorage.setItem('dynamic_auth_token', authToken);
        localStorage.setItem('wallet_address', address);
        setIsAuthenticated(true);
        setWalletAddress(address);
      }
      closeWidget();
    };

    const handleAuthFailure = () => {
      logout();
    };

    // Assuming DynamicWidget emits 'authSuccess' and 'authFailure' events
    window.addEventListener('authSuccess', handleAuthSuccess);
    window.addEventListener('authFailure', handleAuthFailure);

    return () => {
      window.removeEventListener('authSuccess', handleAuthSuccess);
      window.removeEventListener('authFailure', handleAuthFailure);
    };
  }, []);

  return (
    <DynamicAuthContext.Provider value={{ isAuthenticated, walletAddress, openWidget, logout }}>
      <DynamicContextProvider 
        settings={{ 
          environmentId: '7acebce4-9ec4-4363-a4f3-b85925f652a8',
          // eventsOnNetworkSwitch: {
          //   onAuthFlowClose: closeWidget
          // }
        }}
      >
        {children}
        {isWidgetOpen && <DynamicWidget />}
      </DynamicContextProvider>
    </DynamicAuthContext.Provider>
  );
};
