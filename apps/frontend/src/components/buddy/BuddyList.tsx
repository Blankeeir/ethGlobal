// src/components/BuddyList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  VStack, 
  Box, 
  Text, 
  Avatar, 
  HStack, 
  Button,
  Badge,
  useColorModeValue,
  Spinner,
  useToast
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
  const { resolveENS } = useENS();
  const { notifications } = usePush();
  const { eventContract} = useWeb3();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const itemBgColor = useColorModeValue('gray.50', 'gray.700');
  const itemHoverBgColor = useColorModeValue('gray.100', 'gray.600');

  const fetchBuddies = useCallback(async () => {
    if (!eventContract?.buddy) {
      toast({
        title: 'Error',
        description: 'Buddy contract not initialized',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const buddyAddresses = await eventContract.buddy.getConnectedBuddies();
      
      const buddyData = await Promise.all(
        buddyAddresses.map(async (address: string) => {
          const resolvedEns = await resolveENS(address);
          const ensName = typeof resolvedEns === 'string' ? resolvedEns : null;
          const userNotifications = notifications.filter(
            n => n.source === address || n.recipient === address
          );
          const lastMessage = userNotifications[0]?.message || '';
          const lastMessageTime = userNotifications[0]?.timestamp || 0;
          
          return {
            id: address,
            address,
            name: ensName || address,
            ensName,
            lastMessage,
            lastMessageTime: lastMessageTime.toString(),
            avatar: '',
            unreadCount: userNotifications.filter(n => n.status === 'UNREAD').length,
            isOnline: false // Will be updated by presence system
          };
        })
      );

      setBuddies(buddyData);
    } catch (error) {
      console.error('Error fetching buddies:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch buddies',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [eventContract?.buddy, resolveENS, notifications, toast]);

  useEffect(() => {
    fetchBuddies();
  }, [fetchBuddies]);

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
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      <VStack spacing={4} align="stretch">
        <AnimatedContainer variant="fade">
          <Text fontSize="xl" fontWeight="bold">Chat with Buddies</Text>
        </AnimatedContainer>

        <VStack spacing={4}>
          <AnimatePresence>
            {buddies.map((buddy) => (
              <motion.div
                key={buddy.address}
                variants={{
                  hidden: { x: -20, opacity: 0 },
                  visible: {
                    x: 0,
                    opacity: 1,
                    transition: { type: "spring", stiffness: 100 }
                  },
                  exit: { x: 20, opacity: 0 }
                }}
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
                  w="full"
                >
                  <Avatar name={buddy.ensName || buddy.address} size="md" />
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack>
                      <Text fontWeight="bold">
                        {buddy.ensName || `${buddy.address.slice(0, 6)}...${buddy.address.slice(-4)}`}
                      </Text>
                      {buddy.unreadCount > 0 && (
                        <Badge colorScheme="red">
                          {buddy.unreadCount}
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
      </VStack>
    </Box>
  );
};