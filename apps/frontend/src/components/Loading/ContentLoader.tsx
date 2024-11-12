// apps/frontend/src/components/Loading/ContentLoader.tsx
import React from 'react';
import { shouldForwardProp, Spinner, Text, VStack } from '@chakra-ui/react';
import { isValidMotionProp, motion } from 'framer-motion';

import { chakra } from '@chakra-ui/react';

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

interface ContentLoaderProps {
  text?: string;
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  text = 'Loading...' 
}) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // transition={{ duration: 0.3 }}
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="primary.500"
          size="xl"
        />
        <Text color="gray.600">{text}</Text>
      </VStack>
    </MotionBox>
  );
};