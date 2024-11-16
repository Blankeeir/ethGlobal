// apps/frontend/src/components/NFT/NFTDetails.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  Divider,
  Table,
  Tbody,
  Tr,
  Td,
  Badge,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CoinbaseCheckout } from '../Checkout/CoinbaseCheckout';
import { useNFTDetails } from '../../hooks/useNFTDetails';
import { useAnimatedMount } from '../../hooks/useAnimatedMount';

interface NFTDetailsProps {
  tokenId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTDetails: React.FC<NFTDetailsProps> = ({
  tokenId,
  isOpen,
  onClose,
}) => {
  const { nft, loading, purchaseNFT } = useNFTDetails(tokenId);
  const { shouldRender, controls } = useAnimatedMount(isOpen);
  const bgColor = useColorModeValue('white', 'gray.800');

  if (!shouldRender || !nft) return null;

  const handlePurchase = async () => {
    try {
      await purchaseNFT(tokenId);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        as={motion.div}
        initial="hidden"
        animate={controls}
        exit="exit"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }}
        bg={bgColor}
      >
        <ModalHeader>NFT Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Box position="relative">
              <Image
                src={nft.imageUri}
                alt={`NFT ${tokenId}`}
                w="full"
                h="300px"
                objectFit="cover"
                rounded="lg"
              />
              {nft.isBuddyOnly && (
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  colorScheme="purple"
                >
                  Buddy Only
                </Badge>
              )}
            </Box>

            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold">
                {nft.title}
              </Text>
              <Text color="gray.500">
                {nft.description}
              </Text>
            </VStack>

            <Divider />

            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Td>Creator</Td>
                  <Td>{nft.creator}</Td>
                </Tr>
                <Tr>
                  <Td>Price</Td>
                  <Td fontWeight="bold">{nft.price} ETH</Td>
                </Tr>
                <Tr>
                  <Td>Token ID</Td>
                  <Td>{nft.tokenId}</Td>
                </Tr>
                <Tr>
                  <Td>Category</Td>
                  <Td>{nft.category}</Td>
                </Tr>
              </Tbody>
            </Table>

            <HStack justify="space-between">
              <VStack align="start">
                <Text color="gray.500">Current Owner</Text>
                <Text fontWeight="bold">{nft.owner}</Text>
              </VStack>
              <Button
                colorScheme="blue"
                onClick={handlePurchase}
                isLoading={loading}
              >
                Purchase NFT
              </Button>
            </HStack>

            <Divider />

            {/* NFT Activity History */}
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">Activity History</Text>
              {nft.history.map((activity, index) => (
                <HStack
                  key={index}
                  w="full"
                  justify="space-between"
                  p={2}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  rounded="md"
                >
                  <Text>{activity.action}</Text>
                  <Text color="gray.500">{activity.date}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};