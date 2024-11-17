// src/components/Post/ExplorePosts.tsx
import React, { useState } from 'react';
import {
  VStack,
  HStack,
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
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { useNFTPosts } from '../../hooks/useNFTPosts';
import { usePush } from '../../contexts/PushContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { PostNFTCard } from './PostNFTCard';
import { CreatePostModal } from '../modals/CreatePostModal';
import { NFTDetails } from './NFTDetails';
import {Post} from '../../util/types';

type SortOption = 'recent' | 'trending' | 'price' | 'buddyOnly';

export const ExplorePosts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  
  const { 
    posts, 
    loading, 
    createPost,
    likePosts, 
    fetchPosts 
  } = useNFTPosts();
  
  const { sendNotification } = usePush();
  const { address } = useWeb3();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLike = async (tokenId: string, author: string) => {
    try {
      await likePosts(tokenId);
      
      // Send notification to post author
      await sendNotification(
        author,
        'New Like',
        `Someone liked your post!`,
        `/posts/${tokenId}`
      );

      toast({
        title: 'Success',
        description: 'Post liked successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to like post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // const handleComment = async (tokenId: string, comment: string, author: string) => {
  //   try {
  //     await commentOnPost(tokenId, comment);
      
  //     // Send notification to post author
  //     await sendNotification(
  //       author,
  //       'New Comment',
  //       `Someone commented on your post: "${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}"`,
  //       `/posts/${tokenId}`
  //     );

  //     toast({
  //       title: 'Success',
  //       description: 'Comment added successfully',
  //       status: 'success',
  //       duration: 2000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: error instanceof Error ? error.message : 'Failed to add comment',
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const handleShare = async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/posts/${tokenId}`
      );
      toast({
        title: 'Link Copied',
        description: 'Post link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const sortedAndFilteredPosts = posts
    .filter(post => {
      const searchLower = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'price':
          return Number(b.price || '0') - Number(a.price || '0');
        case 'buddyOnly':
          return Number(b.isBuddyOnly) - Number(a.isBuddyOnly);
        default:
          return Number(b.tokenId) - Number(a.tokenId);
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box p={4}>
      <VStack spacing={6} w="full">
        {/* Search and Filter Bar */}
        <HStack w="full" justify="space-between" p={4} bg={bgColor} rounded="lg" shadow="sm">
          <InputGroup size="md" maxW="md">
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderColor={borderColor}
            />
            <InputRightElement>
              <IconButton
                aria-label="Search"
                icon={<FiSearch />}
                variant="ghost"
                size="sm"
              />
            </InputRightElement>
          </InputGroup>

          <HStack spacing={4}>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<FiFilter />}
                variant="outline"
                size="md"
              >
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiTrendingUp />} onClick={() => setSortBy('recent')}>
                  Most Recent
                </MenuItem>
                <MenuItem icon={<FiTrendingUp />} onClick={() => setSortBy('trending')}>
                  Trending
                </MenuItem>
                <MenuItem icon={<FiTrendingUp />} onClick={() => setSortBy('price')}>
                  Highest Price
                </MenuItem>
                <MenuItem icon={<FiTrendingUp />} onClick={() => setSortBy('buddyOnly')}>
                  Buddy Only
                </MenuItem>
              </MenuList>
            </Menu>

            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onOpen}
              isDisabled={!address}
            >
              Create Post
            </Button>
          </HStack>
        </HStack>

        {/* Posts Grid */}
        <Box w="full">
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height="400px" rounded="lg" />
              ))}
            </SimpleGrid>
          ) : sortedAndFilteredPosts.length === 0 ? (
            <VStack py={12} spacing={4}>
              <Text fontSize="lg" color="gray.500">
                No posts found
              </Text>
              <Button colorScheme="blue" onClick={onOpen}>
                Create the first post
              </Button>
            </VStack>
          ) : (
            <SimpleGrid
              as={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
            >
              {sortedAndFilteredPosts.map((post) => (
                <Box
                  as={motion.div}
                  key={post.tokenId}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                >
              <PostNFTCard
                    post={{
                      id: post.tokenId,
                      // tokenId: post.tokenId,
                      // content: post.content,
                      // // imageUri: post.imageUri,
                      // author: post.author,
                      // likes: post.likes,
                      // comments: post.comments,
                      // price: post.price,
                      // isBuddyOnly: post.isBuddyOnly,
                      // // filecoinCID: post.filecoinCID,
                      // chainId: post.chainId,
                      // timestamp: post.createdAt || Date.now()
                    }}
                    // author=''
                    likes={0}
                    comments={0}
                    price=''
                    tokenId=''
                    content=''
                    imageUri=''
                    onLike={() => handleLike(post.tokenId, post.author)}
                    onShare={() => handleShare(post.tokenId)}
                    onClick={() => setSelectedTokenId(post.tokenId)}
                  />
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isOpen} 
        onClose={onClose}
        onSuccess={fetchPosts}
      />

      {selectedTokenId && (
        <NFTDetails
          tokenId={selectedTokenId}
          isOpen={!!selectedTokenId}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </Box>
  );
};