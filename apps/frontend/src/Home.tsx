// Home.tsx
import React, { useState } from 'react';
import { Container, Grid, GridItem, VStack, useBreakpointValue } from '@chakra-ui/react';
import { AnimatedContainer } from './components/Animations/AnimatedContainer';
import { UserStats } from './components/Profile/UserStats';
import { BuddyList } from './components/buddy/BuddyList';
import { ExplorePosts } from './components/ExplorePosts';
import { EventList } from './components/EventList';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <AnimatedContainer
        variant="fade"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <VStack spacing={6} w="full">
          {/* User Statistics with scale animation */}
          <AnimatedContainer variant="scale" animateOnScroll>
            <UserStats />
          </AnimatedContainer>

          {/* Main Content Grid with staggered animations */}
          <Grid
            templateColumns={`repeat(${columns}, 1fr)`}
            gap={6}
            w="full"
            as={motion.div}
          >
            {/* Chat with Buddies */}
            <GridItem>
              <AnimatedContainer
                variant="slide"
                animateOnScroll
                delay={0.1}
              >
                <BuddyList />
              </AnimatedContainer>
            </GridItem>

            {/* Posts Feed */}
            <GridItem>
              <AnimatedContainer
                variant="slide"
                animateOnScroll
                delay={0.2}
              >
                <ExplorePosts />
              </AnimatedContainer>
            </GridItem>

            {/* Events & Communities */}
            <GridItem>
              <AnimatedContainer
                variant="slide"
                animateOnScroll
                delay={0.3}
              >
                <EventList
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </AnimatedContainer>
            </GridItem>
          </Grid>
        </VStack>
      </AnimatedContainer>
    </Container>
  );
};