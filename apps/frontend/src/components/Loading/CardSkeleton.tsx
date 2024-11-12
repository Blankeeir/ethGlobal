
// apps/frontend/src/components/Loading/CardSkeleton.tsx
import React from 'react';
import { Box, Skeleton, SkeletonText, VStack } from '@chakra-ui/react';

export const CardSkeleton: React.FC = () => {
  return (
    <Box 
      borderRadius="xl" 
      overflow="hidden" 
      bg="white" 
      shadow="md"
    >
      <Skeleton height="200px" />
      <VStack p={4} align="start" spacing={2}>
        <Skeleton height="20px" width="150px" />
        <SkeletonText noOfLines={2} spacing={2} />
        <Skeleton height="16px" width="100px" />
      </VStack>
    </Box>
  );
}