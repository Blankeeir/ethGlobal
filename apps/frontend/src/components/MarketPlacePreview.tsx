// components/MarketplacePreview.tsx
import React from 'react';
import { Box, Button, Text, SimpleGrid, useColorModeValue, BoxProps } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, isValidMotionProp, MotionProps, Transition } from 'framer-motion';
import { chakra, shouldForwardProp } from '@chakra-ui/react';
import { useProducts } from '../hooks/useProduct';
import { ProductCard } from './ProductCard';
import { Product } from '../util/types';
// import { AnimatedContainer } from './Animations/AnimatedContainer';
import { CardSkeleton } from './Loading/CardSkeleton';

// Create type-safe motion component
type MotionBoxProps = Omit<BoxProps, keyof MotionProps> & 
  MotionProps & {
    transition?: Transition;
  };

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
}) as React.FC<MotionBoxProps>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

export const MarketplacePreview: React.FC = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts({ limit: 6 });
  const bgColor = useColorModeValue('white', 'gray.700');

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    // <AnimatedContainer>
      <Box 
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        bg={bgColor} 
        p={6} 
        borderRadius="xl" 
        shadow="md"
      >
        <Box 
          mb={6} 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Text 
            fontSize="2xl" 
            fontWeight="bold"
            as={motion.h2}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            // transition={{ duration: 0.5 } as ResponsiveValue<Transition<>>}
          >
            Latest Products
          </Text>
          <Button
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            colorScheme="blue"
            onClick={() => navigate('/marketplace')}
          >
            View All
          </Button>
        </Box>

        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={6}
          as={motion.div}
          variants={containerVariants}
        >
          {isLoading ? (
            // Skeleton loading state with animation
            Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : (
            products?.slice(0, 6).map((product: Product) => (
              <MotionBox
                key={product.id}
                variants={itemVariants}
                whileHover="hover"
                onClick={() => handleProductClick(product.id)}
                cursor="pointer"
              >
                <ProductCard 
                  product={product} 
                  onClick={() => handleProductClick(product.id)}
                />
              </MotionBox>
            ))
          )}
        </SimpleGrid>

        <Box 
          mt={6} 
          textAlign="center"
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          // transition={{ delay: 0.5, duration: 0.5 } as {delay: number, duration: number}}
        >
          <Button
            size="lg"
            colorScheme="blue"
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/marketplace')}
          >
            Explore Full Marketplace
          </Button>
        </Box>
      </Box>
    // </AnimatedContainer>
  );
};