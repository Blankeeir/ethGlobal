import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast/ToastContext';
import { lightTheme } from './theme';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './Home';
import { BuddyList } from './components/buddy/BuddyList';
import { EventList } from './components/event/EventList.tsx';
import { Profile } from './components/Profile/Profile';
import { DynamicAuthProvider } from './components/Auth/DynamicAuthProvider';
import { Web3Provider } from './contexts/Web3Context.tsx';
import { PushProvider } from './contexts/PushContext.tsx';
import { ENSProvider } from './contexts/ENSContext.tsx';
import { WorldIDProvider } from './contexts/WorldIDContext.tsx';

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
              <WorldIDProvider>
                <PushProvider>
                  <ToastProvider>
                    <Router>
                      <Box minHeight="100vh" display="flex" flexDirection="column">
                        <Navbar />
                        <Box flex="1" as="main" bg="gray.50">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/list-buddies" element={<BuddyList />} />
                            <Route path="/list-events" element={<EventList selectedCategory="" onCategoryChange={() => {}} />} />
                            <Route path="/profile" element={<Profile />} />
                          </Routes>
                        </Box>
                        <Footer />
                      </Box>
                    </Router>
                  </ToastProvider>
                </PushProvider>
              </WorldIDProvider>
            </ENSProvider>
          </Web3Provider>
        </DynamicAuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;
