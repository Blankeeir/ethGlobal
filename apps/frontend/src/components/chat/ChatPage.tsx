// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  IconButton,
  Divider,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { useWeb3 } from '../../hooks/useWeb3';
import { useENS } from '../../hooks/useEns';
import { usePushProtocol } from '../../hooks/usePushProtocol';
import { useFilecoinStorage } from '../../hooks/useFilecoinStorage';
import { useLayerZero } from '../../hooks/useLayerZero';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  filecoinCID?: string;
}

export const ChatPage: React.FC = () => {
  const { buddyAddress } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const { address } = useWeb3();
  const { resolveENSName, ensName } = useENS();
  const { sendNotification } = usePushProtocol();
  const { storeData } = useFilecoinStorage();
  const { sendCrossChainMessage } = useLayerZero();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (buddyAddress) {
      loadMessages();
      resolveENSName(buddyAddress);
    }
  }, [buddyAddress]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Fetch messages from Filecoin and database
      const storedMessages = await fetchStoredMessages();
      setMessages(storedMessages);
    } catch (error: unknown) {
      toast({
        title: 'Error loading messages',
        description: (error as Error).message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredMessages = async () => {
    // Fetch messages from your backend/Filecoin
    const response = await fetch(`/api/messages/${address}/${buddyAddress}`);
    return response.json();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !buddyAddress) return;

    try {
      setLoading(true);
      
      // Store message content on Filecoin
      const contentCID = await storeData({
        content: newMessage,
        timestamp: Date.now(),
        from: address,
        to: buddyAddress
      });

      // Send cross-chain message using Layer Zero
      await sendCrossChainMessage(buddyAddress, {
        type: 'chat',
        content: newMessage,
        contentCID
      });

      // Send notification using Push Protocol
      await sendNotification(
        buddyAddress,
        'New Message',
        `${ensName || address} sent you a message`
      );

      // Add message to local state
      const newMessageObj = {
        id: Date.now().toString(),
        from: address!,
        to: buddyAddress,
        content: newMessage,
        timestamp: Date.now(),
        filecoinCID: contentCID
      };

      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');

    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOwn = message.from === address;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Flex justify={isOwn ? 'flex-end' : 'flex-start'} mb={4}>
          {!isOwn && (
            <Avatar
              size="sm"
              name={message.from}
              mr={2}
            />
          )}
          <Box
            bg={isOwn ? 'blue.500' : 'gray.100'}
            color={isOwn ? 'white' : 'black'}
            borderRadius="lg"
            px={4}
            py={2}
            maxW="70%"
          >
            <Text>{message.content}</Text>
            <Text
              fontSize="xs"
              color={isOwn ? 'whiteAlpha.700' : 'gray.500'}
              textAlign="right"
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </Box>
          {isOwn && (
            <Avatar
              size="sm"
              name={address}
              ml={2}
            />
          )}
        </Flex>
      </motion.div>
    );
  };

  return (
    <Box
      h="calc(100vh - 64px)"
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
    >
      {/* Chat Header */}
      <Box p={4} borderBottomWidth={1} borderColor={borderColor}>
        <HStack>
          <Avatar
            size="sm"
            name={ensName || buddyAddress}
          />
          <Text fontWeight="bold">
            {ensName || `${buddyAddress?.slice(0, 6)}...${buddyAddress?.slice(-4)}`}
          </Text>
        </HStack>
      </Box>

      {/* Messages Area */}
      <Box
        h="calc(100% - 140px)"
        overflowY="auto"
        p={4}
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        {loading ? (
          <Flex justify="center" align="center" h="full">
            <Spinner />
          </Flex>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        p={4}
        borderTopWidth={1}
        borderColor={borderColor}
        bg={bgColor}
      >
        <HStack>
          <IconButton
            aria-label="Attach file"
            icon={<FiPaperclip />}
            variant="ghost"
          />
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
            isLoading={loading}
            leftIcon={<FiSend />}
          >
            Send
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};