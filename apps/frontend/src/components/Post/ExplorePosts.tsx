// apps/frontend/src/components/ExplorePosts/ExplorePosts.tsx
import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  SimpleGrid,
  Text,
  Button,
  useDisclosure,
  useColorModeValue,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { PostNFTCard } from './PostNFTCard';
import { CreatePostModal } from '../modals/CreatePostModal';
import { useWeb3 } from '../../contexts/Web3Context';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface Post {
  id: string;
  tokenId: string;
  content: string;
  imageUri: string;
  author: string;
  likes: number;
  comments: number;
  price?: string;
  isBuddyOnly: boolean;
  filecoinCID: string;
  chainId: number;
}

export const ExplorePosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'price'>('recent');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { shouldRender, controls } = useAnimatedMount(true);
  const { postContract, sendCrossChainMessage } = useWeb3();
  const { storeData } = useFilecoin();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchPosts();
  }, [postContract]);

  const fetchPosts = async () => {
    if (!postContract) return;

    try {
      setLoading(true);
      const totalPosts = await postContract.getCurrentTokenId();
      const fetchedPosts = await Promise.all(
        Array.from({ length: totalPosts.toNumber() }, (_, i) => 
          postContract.getPost(i + 1)
        )
      );

      const formattedPosts = await Promise.all(
        fetchedPosts.map(async (post) => {
          // Fetch content from Filecoin
          const content = await storeData.retrieveData(post.filecoinCID);
          return {
            id: post.tokenId.toString(),
            tokenId: post.tokenId.toString(),
            content: content.content,
            imageUri: content.imageUri,
            author: post.author,
            likes: post.likes.toNumber(),
            comments: post.commentCount.toNumber(),
            price: post.price?.toString(),
            isBuddyOnly: post.isBuddyOnly,
            filecoinCID: post.filecoinCID,
            chainId: post.chainId.toNumber(),
          };
        })
      );

      setPosts(formattedPosts);
    } catch (error: any) {
      toast.error('Failed to fetch posts', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (tokenId: string) => {
    if (!postContract) return;

    try {
      const tx = await postContract.likePost(tokenId);
      await tx.wait();
      
      // Update posts state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.tokenId === tokenId 
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );

      toast.success('Post liked successfully');
    } catch (error: any) {
      toast.error('Failed to like post', {
        description: error.message
      });
    }
  };

  const handleComment = async (post: Post, comment: string) => {
    if (!postContract) return;

    try {
      if (post.chainId !== postContract.chainId) {
        // Cross-chain comment
        await sendCrossChainMessage(
          post.chainId,
          ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'string'],
            [post.tokenId, comment]
          )
        );
      } else {
        // Same chain comment
        const tx = await postContract.addComment(post.tokenId, comment);
        await tx.wait();
      }

      toast.success('Comment added successfully');
      await fetchPosts();
    } catch (error: any) {
      toast.error('Failed to add comment', {
        description: error.message
      });
    }
  };

  const sortedAndFilteredPosts = posts
    .filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'price':
          return parseFloat(b.price || '0') - parseFloat(a.price || '0');
        default:
          return parseInt(b.tokenId) - parseInt(a.tokenId);
      }
    });

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      <Box
        as={motion.div}
        initial="hidden"
        animate={controls}
        exit="exit"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }}
      >
        <VStack spacing={6} w="full">
          <HStack w="full" justify="space-between" p={4}>
            <InputGroup size="md">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputRightElement>
                <IconButton
                  aria-label="Search"
                  icon={<FiSearch />}
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>

            <HStack spacing={4}>
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FiFilter />}
                  variant="outline"
                >
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setSortBy('recent')}>Most Recent</MenuItem>
                  <MenuItem onClick={() => setSortBy('trending')}>Trending</MenuItem>
                  <MenuItem onClick={() => setSortBy('price')}>Highest Price</MenuItem>
                </MenuList>
              </Menu>

              <Button colorScheme="blue" onClick={onOpen}>
                Create Post
              </Button>
            </HStack>
          </HStack>

          {loading ? (
            <Spinner size="xl" />
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
              w="full"
              p={4}
            >
              {sortedAndFilteredPosts.map((post) => (
                <PostNFTCard
                  key={post.tokenId}
                  post={post}
                  onLike={() => handleLike(post.tokenId)}
                  onComment={handleComment}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>

        <CreatePostModal isOpen={isOpen} onClose={onClose} onSuccess={fetchPosts} />
      </Box>
    </AnimatePresence>
  );
};