// src/components/Buddy/BuddyProfile.tsx
import React from 'react';
import { Box, VStack, HStack, Avatar, Text, Button } from '@chakra-ui/react';
import { useENS } from '../../hooks/useEns';
import { useEffect } from 'react';


interface BuddyProfileProps {
  address: string;
}

export const BuddyProfile: React.FC<BuddyProfileProps> = ({ address }) => {
  const { ensName, ensAvatar, lookupAddress } = useENS();

  useEffect(() => {
    if (address) {
      lookupAddress(address);
    }
  }, [address, lookupAddress]);

  return (
    <Box p={4} bg="white" shadow="sm" rounded="lg">
      <VStack spacing={4}>
        <Avatar 
          src={ensAvatar || undefined}
          name={ensName || address}
          size="xl"
        />
        <Text fontSize="xl" fontWeight="bold">
          {ensName || address}
        </Text>
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => {/* Handle connect */}}>
            Connect
          </Button>
          <Button variant="outline" onClick={() => {/* Handle message */}}>
            Message
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
