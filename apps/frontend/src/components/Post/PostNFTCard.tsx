// apps/frontend/src/components/NFTCard/PostNFTCard.tsx
import React from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';
import { useAnimatedMount } from '../../hooks/useAnimatedMount';
import { useCoinbaseSDK } from '../../hooks/useCoinbaseSDK';

interface PostNFTCardProps {
  tokenId: string;
  content: string;
  imageUri: string;
  author: string;
  likes: number;
  comments: number;
  price?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBuy?: () => void;
}

export const PostNFTCard: React.FC<PostNFTCardProps> = ({
  tokenId,
  content,
  imageUri,
  author,
  likes,
  comments,
  price,
  isLiked,
  onLike,
  onComment,
  onShare,
  onBuy,
}) => {
  const { shouldRender, controls } = useAnimatedMount(true);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (!shouldRender) return null;

  return (
    <Box
      as={motion.div}
      initial="hidden"
      animate={controls}
      exit="exit"
      variants={cardVariants}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
    >
      <Image
        src={imageUri}
        alt={`Post ${tokenId}`}
        w="full"
        h="200px"
        objectFit="cover"
      />

      <VStack p={4} spacing={4} align="stretch">
        <Text fontSize="md" noOfLines={3}>
          {content}
        </Text>

        <HStack justify="space-between">
          <HStack spacing={4}>
            <IconButton
              aria-label="Like"
              icon={<FiHeart fill={isLiked ? 'red' : 'none'} />}
              onClick={onLike}
              variant="ghost"
              colorScheme={isLiked ? 'red' : 'gray'}
            />
            <Text fontSize="sm" color="gray.500">
              {likes}
            </Text>
            
            <IconButton
              aria-label="Comment"
              icon={<FiMessageCircle />}
              onClick={onComment}
              variant="ghost"
            />
            <Text fontSize="sm" color="gray.500">
              {comments}
            </Text>
            
            <IconButton
              aria-label="Share"
              icon={<FiShare2 />}
              onClick={onShare}
              variant="ghost"
            />
          </HStack>

          {price && (
            <Button
              colorScheme="blue"
              onClick={onBuy}
              size="sm"
            >
              Buy for {price} ETH
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};