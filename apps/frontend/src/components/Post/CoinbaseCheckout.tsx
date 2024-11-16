// apps/frontend/src/components/Checkout/CoinbaseCheckout.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useCoinbaseSDK } from '../../hooks/useCoinbaseSDK';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string;
  price: string;
  onSuccess: () => void;
}

export const CoinbaseCheckout: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  tokenId,
  price,
  onSuccess,
}) => {
  const { sdk, loading } = useCoinbaseSDK({
    appName: 'Mental Health NFT',
    appLogoUrl: '/logo.png',
    darkMode: useColorModeValue(false, true),
  });

  const handleCheckout = async () => {
    if (!sdk) return;

    try {
      // Initialize Coinbase checkout
      const checkout = await sdk.createCheckout({
        tokenId,
        price,
        currency: 'ETH',
      });

      // Handle successful purchase
      checkout.on('success', () => {
        onSuccess();
        onClose();
      });

      // Open checkout
      await checkout.show();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <ModalHeader>Complete Purchase</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} py={4}>
            <Text>You are about to purchase NFT #{tokenId}</Text>
            <Text fontWeight="bold">Price: {price} ETH</Text>
            <Button
              colorScheme="blue"
              onClick={handleCheckout}
              isLoading={loading}
              w="full"
            >
              Proceed to Checkout
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
