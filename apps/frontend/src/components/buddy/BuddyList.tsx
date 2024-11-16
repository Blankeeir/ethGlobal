// BuddyList.tsx
import React, { useState, useEffect } from 'react';
import { 
  VStack, 
  Box, 
  Text, 
  Avatar, 
  HStack, 
  Button,
  Badge,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useENS } from '../../hooks/useEns';
import { usePush } from '../../contexts/PushContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { AnimatedContainer } from '../Animations/AnimatedContainer';
import { Buddy } from '../../util/types';

export const BuddyList: React.FC = () => {
    const { ref, controls } = useScrollAnimation();
    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [loading, setLoading] = useState(true);
    const { resolveENSName } = useENS();
    const { getNotifications } = usePush();
    const { eventContract } = useWeb3();
    const navigate = useNavigate();
  
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const itemBgColor = useColorModeValue('gray.50', 'gray.700');
    const itemHoverBgColor = useColorModeValue('gray.100', 'gray.600');
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      };
    
      const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
          x: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 100
          }
        },
        exit: {
          x: 20,
          opacity: 0
        }
      };

  
    useEffect(() => {
      const fetchBuddies = async () => {
        try {
          // Get connected buddies from the contract
          const buddyAddresses = await contract.getConnectedBuddies();
          
          // Fetch additional data for each buddy
          const buddyData = await Promise.all(
            buddyAddresses.map(async (address: string) => {
              const ensName = await resolveENSName(address);
              const notifications = await getNotifications(address);
              const lastMessage = notifications[0]?.message || '';
              const lastMessageTime = notifications[0]?.timestamp || 0;
              
              return {
                address,
                ensName,
                lastMessage,
                lastMessageTime,
                isOnline: Math.random() > 0.5 // Mock online status
              };
            })
          );
  
          setBuddies(buddyData);
        } catch (error) {
          console.error('Error fetching buddies:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchBuddies();
    }, [contract, resolveENSName, getNotifications]);
  
    const handleChatClick = (buddyAddress: string) => {
      navigate(`/chat/${buddyAddress}`);
    };
  
    if (loading) {
      return (
        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <VStack spacing={4} align="center">
            <Spinner size="xl" />
            <Text>Loading buddies...</Text>
          </VStack>
        </Box>
      );
    }
  
    return (
    <Box
      ref={ref}
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
      as={motion.div}
      animate={controls}
      initial="hidden"
      variants={listVariants}
    >
      <VStack spacing={4} align="stretch">
        <AnimatedContainer variant="fade">
          <Text fontSize="xl" fontWeight="bold">Chat with Buddies</Text>
        </AnimatedContainer>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VStack spacing={4} align="center">
                <Spinner size="xl" />
                <Text>Loading buddies...</Text>
              </VStack>
            </motion.div>
          ) : (
            <VStack spacing={4}>
              <AnimatePresence>
                {buddies.map((buddy) => (
                  <motion.div
                    key={buddy.address}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <HStack
                      p={4}
                      bg={itemBgColor}
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: itemHoverBgColor }}
                      onClick={() => handleChatClick(buddy.address)}
                    >
                      <Avatar name={buddy.ensName || buddy.address} size="md" />
                      <VStack align="start" flex={1} spacing={1}>
                        <HStack>
                          <Text fontWeight="bold">
                            {buddy.ensName || `${buddy.address.slice(0, 6)}...${buddy.address.slice(-4)}`}
                          </Text>
                          {buddy.isOnline && (
                            <Badge colorScheme="green" variant="subtle">
                              Online
                            </Badge>
                          )}
                        </HStack>
                        {buddy.lastMessage && (
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {buddy.lastMessage}
                          </Text>
                        )}
                      </VStack>
                      <Button
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        size="sm"
                        colorScheme="blue"
                      >
                        Chat
                      </Button>
                    </HStack>
                  </motion.div>
                ))}
              </AnimatePresence>
            </VStack>
          )}
        </AnimatePresence>
      </VStack>
    </Box>
  );
};