// apps/frontend/src/components/ProductCard.tsx
import React from 'react';
import {
  // Box,
  Image,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, MotionProps } from 'framer-motion';
import { isValidMotionProp } from 'framer-motion';
import { chakra, BoxProps } from '@chakra-ui/react';
import { shouldForwardProp } from '@chakra-ui/react';

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
}) as React.FC<BoxProps & MotionProps>;

interface Product {
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
  location: string;
}

export const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({
  product,
  onClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <MotionBox
      bg={bgColor}
      borderRadius="xl"
      overflow="hidden"
      shadow="md"
      whileHover={{ y: -4 }}
      // transition={{ duration: 0.2 }}
      cursor="pointer"
      onClick={onClick}
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        height="200px"
        width="100%"
        objectFit="cover"
      />
      <VStack p={4} align="start" spacing={2}>
        <HStack justify="space-between" width="100%">
          <Badge colorScheme="green">{product.category}</Badge>
          <Text fontWeight="bold" color="primary.500">
            {product.price} VET
          </Text>
        </HStack>
        <Text fontWeight="semibold" fontSize="lg">
          {product.name}
        </Text>
        <Text noOfLines={2} color="gray.600">
          {product.description}
        </Text>
        <HStack spacing={2} mt={2}>
          <Badge colorScheme="blue">
            {product.quantity} left
          </Badge>
          <Badge colorScheme="purple">
            {product.location}
          </Badge>
        </HStack>
      </VStack>
    </MotionBox>
  );
};