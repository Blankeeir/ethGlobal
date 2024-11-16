import React from 'react';
import { Box, Skeleton, Stack, useColorModeValue, chakra, shouldForwardProp } from '@chakra-ui/react';
import { motion, isValidMotionProp } from 'framer-motion';

// Create a motion-enabled Box component
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack spacing={4}>
      {Array.from({ length: count }).map((_, i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.3, delay: i * 0.1 },
          }}
          exit={{ opacity: 0 }}
          bg={bgColor} // Correct shorthand for background color
          p={6}
          rounded="lg"
          shadow="sm"
        >
          <Stack spacing={4}>
            <Skeleton startColor="gray.200" endColor="gray.300" height="20px" width="200px" />
            <Skeleton startColor="gray.200" endColor="gray.300" height="20px" width="100%" />
            <Skeleton startColor="gray.200" endColor="gray.300" height="20px" width="60%" />
            <Stack direction="row" spacing={4}>
              <Skeleton startColor="gray.200" endColor="gray.300" height="40px" width="40px" borderRadius="full" />
              <Skeleton startColor="gray.200" endColor="gray.300" height="40px" width="100px" />
            </Stack>
          </Stack>
        </MotionBox>
      ))}
    </Stack>
  );
};
