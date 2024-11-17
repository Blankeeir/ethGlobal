
import { 
  Box,
  Image,
  Text,
  HStack,
  VStack,
  IconButton,
  Button,
  useColorModeValue,
  Flex
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';
import { useAnimatedCounter } from '../../hooks/useAnimationCounter';
import { useAnimationControls } from 'framer-motion';

interface PostNFTCardProps {
  post: {
    id: string;
    title?: string;
    creator?: string;
  };
  imageUri: string;
  tokenId: string | number;
  content: string;
  likes: number;
  comments: number;
  price?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBuy?: () => void;
  onClick: () => void;
}

export const PostNFTCard: React.FC<PostNFTCardProps> = ({
  post,
  imageUri,
  tokenId,
  content,
  isLiked,
  likes,
  comments,
  price,
  onLike,
  onComment,
  onShare,
  onBuy,
  onClick
}) => {
// With:
const controls = useAnimationControls();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

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
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      onClick={onClick}
      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
      transition="all 0.2s"
    >
      <Image
        src={imageUri}
        alt={`NFT ${tokenId}`}
        w="full"
        h="200px"
        objectFit="cover"
      />
      
      <VStack p={4} align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          {post.title || `NFT #${tokenId}`}
        </Text>
        
        <Text color={secondaryTextColor} noOfLines={2}>
          {content}
        </Text>

        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              aria-label="Like"
              icon={<FiHeart fill={isLiked ? 'red' : 'none'} />}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            />
            <Text fontSize="sm" color={secondaryTextColor}>{likes}</Text>
            
            <IconButton
              aria-label="Comment"
              icon={<FiMessageCircle />}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onComment?.();
              }}
            />
            <Text fontSize="sm" color={secondaryTextColor}>{comments}</Text>
            
            <IconButton
              aria-label="Share"
              icon={<FiShare2 />}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
            />
          </HStack>

          {price && (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBuy?.();
              }}
            >
              Buy for {price}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};