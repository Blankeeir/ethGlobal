// apps/frontend/src/components/NFTCard/NFTCardGrid.tsx
import React from 'react';
import { SimpleGrid, Box } from '@chakra-ui/react';
import { PostNFTCard } from './PostNFTCard';
import { AnimatedContainer } from '../Animations/AnimatedContainer';
import { ContentLoader } from '../Loading/ContentLoader';

interface NFTCardGridProps {
  posts: any[];
  loading: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onBuy: (id: string) => void;
}

export const NFTCardGrid: React.FC<NFTCardGridProps> = ({
  posts,
  loading,
  onLike,
  onComment,
  onShare,
  onBuy,
}) => {
  if (loading) {
    return (
      <Box height="400px">
        <ContentLoader />
      </Box>
    );
  }

  return (
    <AnimatedContainer
      variant="fade"
      staggerChildren
      staggerDelay={0.1}
    >
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={6}
      >
        {posts.map((post) => (
          <PostNFTCard
            key={post.tokenId}
            {...post}
            onLike={() => onLike(post.tokenId)}
            onComment={() => onComment(post.tokenId)}
            onShare={() => onShare(post.tokenId)}
            onBuy={() => onBuy(post.tokenId)}
          />
        ))}
      </SimpleGrid>
    </AnimatedContainer>
  );
};