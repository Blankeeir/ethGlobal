// App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast/ToastContext';
import { lightTheme } from './theme';
// import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
// const walletConnectOptions: WalletConnectOptions = {
//   projectId: 'a0b855ceaf109dbc8426479a4c3d38d8',
//   metadata: {
//       name: 'Servare',
//       description: 'A sample VeChain dApp',
//       url: window.location.origin,
//       icons: [`${window.location.origin}/images/logo/my-dapp.png`],
//   },
// };

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './Home';
import { BuddyList } from './components/buddy/BuddyList';
// import { BuddyChat } from './BuddyChat';
import { EventList} from './components/event/EventsList';
import { Profile } from './pages/Profile';

// import { UserProfile } from './components/Profile/UserProfile';

import React from 'react';

import { DynamicAuthProvider } from './components/Auth/DynamicAuthProvider';

import { Web3Provider } from './contexts/Web3Context';
import { PushProvider } from './contexts/PushContext';
import { ENSProvider } from './contexts/ENSContext';
// import { theme } from './theme';



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
    <ChakraProvider theme={lightTheme}>
      <QueryClientProvider client={queryClient}>
        <DynamicAuthProvider>
          <Web3Provider>
            <ENSProvider>
              <PushProvider>
                <ToastProvider>
                  <Router>
                    <Box minHeight="100vh" display="flex" flexDirection="column">
                      <Navbar />
                      <Box flex="1" as="main" bg="gray.50">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/chat/:buddyAddress?" element={<BuddyChat />} />
                          <Route path="/event/:eventId" element={<EventDetails />} />
                          <Route path="/profile/:address?" element={<Profile />} />
                        </Routes>
                      </Box>
                      <Footer />
                    </Box>
                  </Router>
                </ToastProvider>
              </PushProvider>
            </ENSProvider>
          </Web3Provider>
        </DynamicAuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;