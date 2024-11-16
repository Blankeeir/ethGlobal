// src/components/Auth/DynamicAuthProvider.tsx

import React, { createContext, useEffect, useState } from 'react';
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';

interface DynamicAuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const DynamicAuthContext = createContext<DynamicAuthContextType | null>(null);

import { ReactNode } from 'react';

export const DynamicAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const authToken = localStorage.getItem('dynamic_auth_token');
      setIsAuthenticated(!!authToken);
    };
    checkAuth();
  }, []);

  return (
    <DynamicAuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <DynamicContextProvider settings={{ environmentId: 'YOUR_ENVIRONMENT_ID' }}>
        {children}
        <DynamicWidget />
      </DynamicContextProvider>
    </DynamicAuthContext.Provider>
  );
};

