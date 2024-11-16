// pages/Home.tsx
import React from 'react';
import { Box, Container, VStack, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { InfoCard } from './components/InfoCard';
import { Instructions } from './components/Instructions';
import { MarketplacePreview } from './components/MarketPlacePreview';
// import { AnimatedContainer } from './components/Animations/AnimatedContainer';

export const Home: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box bg={bgColor} minH="100%">
      <Container maxW="container.xl" py={8}>
        {/* <AnimatedContainer
          variant="slide"
          staggerChildren
          staggerDelay={0.2}
          animateOnScroll
        > */}
          <VStack spacing={8} w="full">
            {/* InfoCard Section */}
            <Box w="full">
              <InfoCard />
            </Box>

            {/* Instructions Section */}
            <Box w="full">
              <Instructions />
            </Box>

            {/* Marketplace Preview Section */}
            <Box w="full">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <MarketplacePreview />
              </SimpleGrid>
            </Box>
          </VStack>
        {/* </AnimatedContainer> */}
      </Container>
    </Box>
  );
};
