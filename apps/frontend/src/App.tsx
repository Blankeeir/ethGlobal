// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { DAppKitProvider } from '@vechain/dapp-kit-react';
// import type { WalletConnectOptions } from '@vechain/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast/ToastContext';
import { lightTheme } from './theme';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

const walletConnectOptions: WalletConnectOptions = {
  projectId: 'a0b855ceaf109dbc8426479a4c3d38d8',
  metadata: {
      name: 'Servare',
      description: 'A sample VeChain dApp',
      url: window.location.origin,
      icons: [`${window.location.origin}/images/logo/my-dapp.png`],
  },
};

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './Home';
import { Marketplace } from './components/MarketPlace';
import { ProductEntryForm } from './components/Form/ProductEntryForm';
import { Profile } from './components/Profile/Profile';
import { SupplyChainTracking } from './components/Tracking/SupplyChainTracking';
import { DynamicAuthProvider } from './components/Auth/DynamicAuthProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App: React.FC = () => {
  return (
    
    <Router>
        {/* <Home/>
        <Marketplace />
        <ProductEntryForm />
        <SupplyChainTracking />
        <Profile /> */}
      <ChakraProvider theme={lightTheme}>
        <QueryClientProvider client={queryClient}>
          <DynamicAuthProvider>
            <DAppKitProvider
            nodeUrl={'https://testnet.vechain.org/'}
            usePersistence={true}
            genesis={'test'}
            walletConnectOptions={{
              projectId: 'a0b855ceaf109dbc8426479a4c3d38d8',
              metadata: {
                name: 'Servare',
                description: 'A decentralized marketplace',
                url: window.location.origin,
                icons: [`${window.location.origin}/images/logo/my-dapp.png`],
              },
            }}
          >
              <ToastProvider>
              <Box minH="100vh" display="flex" flexDirection="column">
                <Navbar />
                <Box flex="1" as="main">

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/submit" element={<ProductEntryForm />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tracking" element={<SupplyChainTracking />} />
                </Routes>
                </Box>
                <Footer />
              </Box>
              </ToastProvider> 
            </DAppKitProvider>
          </DynamicAuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </Router>
  );
};

export default App;