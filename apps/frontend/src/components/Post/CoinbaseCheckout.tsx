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
      const response = await fetch('https://api.commerce.coinbase.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY || '',
        },
        body: JSON.stringify({
          name: `NFT #${tokenId}`,
          description: `Purchase NFT #${tokenId}`,
          pricing_type: 'fixed_price',
          local_price: {
            amount: price,
            currency: 'ETH'
          }
        })
      });

      const charge = await response.json();
      window.location.href = charge.data.hosted_url;
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
