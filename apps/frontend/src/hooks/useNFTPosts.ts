// hooks/useNFTPosts.ts
import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useFilecoinStorage } from '../hooks/useFilecoinStorage';
import { useToast } from '@chakra-ui/react';
import { utils } from 'ethers';
const { parseEther } = utils;

interface NFTPost {
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
  createdAt: number;
}

export const useNFTPosts = () => {
  const [posts, setPosts] = useState<NFTPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { eventContract, address, context: { chainId } } = useWeb3(); // Fixed case sensitivity
  const { uploadFile, retrieveData } = useFilecoinStorage();
  const toast = useToast();

  const fetchPosts = useCallback(async () => {
    if (eventContract?.postNFT) return;

    try {
      setLoading(true);
    const totalPosts = await eventContract?.postNFT?.getCurrentTokenId();
    if (!totalPosts) return;
    
    const fetchedPosts = await Promise.all(
      Array.from({ length: totalPosts.toNumber() }, (_, i) =>
        eventContract?.postNFT?.getPost(i + 1).catch((error: Error) => {
        console.error(`Error fetching post ${i + 1}:`, error);
        return null;
          })
        )
      );

      const formattedPosts = await Promise.all(
        fetchedPosts
          .filter((post): post is NonNullable<typeof post> => post !== null)
          .map(async (post) => {
            try {
              const content = await retrieveData(post.filecoinCID) as { content: string; imageUri: string };
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
                createdAt: post.timestamp.toNumber()
              };
            } catch (error) {
              console.error(`Error formatting post ${post.tokenId}:`, error);
              return null;
            }
          })
      );

      setPosts(formattedPosts.filter((post): post is NonNullable<typeof post> => post !== null) as NFTPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch posts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [eventContract?.postNFT, retrieveData, toast]);

  const createPost = async (content: string, imageUri?: string, price?: string) => {
    if (!eventContract?.postNFT || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const postData = { content, imageUri };
      const cid = await uploadFile(postData);

      const tx = await eventContract.postNFT.createPost(
        cid,
        parseEther(price || '0'),
        false // isBuddyOnly
      );
      await tx.wait();

      await fetchPosts();
      toast({
        title: 'Success',
        description: 'Post created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const likePosts = async (tokenId: string) => {
    if (!eventContract?.postNFT || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const tx = await eventContract.postNFT.likePost(tokenId);
      await tx.wait();

      await fetchPosts();
      toast({
        title: 'Success',
        description: 'Post liked successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to like post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (eventContract?.postNFT) {
      fetchPosts();
    }
  }, [fetchPosts, chainId, eventContract?.postNFT]);

  return {
    posts,
    loading,
    createPost,
    fetchPosts,
    likePosts,
  };
};