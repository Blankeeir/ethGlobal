// src/components/NFT/NFTDetails.tsx
import React, { useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  Skeleton,
  useToast,
  Avatar,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useNFTPosts } from '../../hooks/useNFTPosts';
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';
import {Post } from '../../util/types';
import {utils} from 'ethers';
import { parseEther } from 'ethers/lib/utils';

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
  const { 
    posts, 
    loading, 
    likePosts, 
  } = useNFTPosts();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const post = useMemo(() => 
    posts.find(p => p.tokenId === tokenId),
    [posts, tokenId]
  );

  if (!isOpen) return null;

  // const handlePurchase = async () => {
  //   if (!post) return;

  //   try {
  //     await purchasePost(tokenId, post.price || '0');
  //     toast({
  //       title: 'Success',
  //       description: 'NFT purchased successfully!',
  //       status: 'success',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     onClose();
  //   } catch (error) {
  //     console.error('Purchase failed:', error);
  //     toast({
  //       title: 'Error',
  //       description: error instanceof Error ? error.message : 'Failed to purchase NFT',
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const handleLike = async () => {
    if (!post) return;

    try {
      await likePosts(tokenId);
      toast({
        title: 'Success',
        description: 'Post liked!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/posts/${tokenId}`
      );
      toast({
        title: 'Link Copied',
        description: 'Post link copied to clipboard!',
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

  return (
    <AnimatePresence>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="2xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          bg={bgColor}
          borderColor={borderColor}
          borderWidth="1px"
        >
          <ModalHeader>
            <HStack justify="space-between">
              <Text>Post Details</Text>
              {post?.isBuddyOnly && (
                <Badge colorScheme="purple">Buddy Only</Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {loading || !post ? (
              <VStack spacing={4}>
                <Skeleton height="300px" width="100%" />
                <Skeleton height="20px" width="60%" />
                <Skeleton height="20px" width="100%" />
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Image */}
                {post.imageUri && (
                  <Box position="relative" overflow="hidden" borderRadius="lg">
                    <Image
                      src={post.imageUri}
                      alt={`Post ${tokenId}`}
                      width="100%"
                      height="auto"
                      maxH="400px"
                      objectFit="cover"
                    />
                  </Box>
                )}

                {/* Author Info */}
                <HStack spacing={4}>
                  <Avatar size="sm" name={post.author} />
                  <Text fontWeight="bold">
                    {post.author.slice(0, 6)}...{post.author.slice(-4)}
                  </Text>
                </HStack>

                {/* Content */}
                <Text fontSize="lg">{post.content}</Text>

                {/* Stats */}
                <HStack spacing={6}>
                  <HStack>
                    <Button
                      leftIcon={<FiHeart />}
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                    >
                      {post.likes}
                    </Button>
                  </HStack>
                  <HStack>
                    <Button
                      leftIcon={<FiMessageCircle />}
                      variant="ghost"
                      size="sm"
                    >
                      {post.comments}
                    </Button>
                  </HStack>
                  <Button
                    leftIcon={<FiShare2 />}
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                </HStack>

                <Divider />

                {/* Details */}
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Td fontWeight="bold">Token ID</Td>
                      <Td>{post.tokenId}</Td>
                    </Tr>
                    {post.price && (
                      <Tr>
                        <Td fontWeight="bold">Price</Td>
                        <Td>{utils.formatEther(post.price)} ETH</Td>
                      </Tr>
                    )}
                    <Tr>
                      <Td fontWeight="bold">Chain ID</Td>
                      <Td>{post.chainId}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Created</Td>
                      <Td>{new Date(post.createdAt).toLocaleString()}</Td>
                    </Tr>
                  </Tbody>
                </Table>

                {/* Comments Section */}
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Comments</Text>
                  {post.comments > 0 ? (
                    <VStack w="full" spacing={2}>
                      {/* Implement comments display here */}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No comments yet</Text>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={4}>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              {post?.price && utils.formatEther(post.price) !== '0' && (
                <Button
                  colorScheme="blue"
                  onClick={() => likePosts(tokenId)}
                  isLoading={loading}
                  loadingText="Processing..."
                >
                  Purchase ({utils.formatEther(post.price)} ETH)
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AnimatePresence>
  );
};