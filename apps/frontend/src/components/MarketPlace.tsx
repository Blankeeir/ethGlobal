// apps/frontend/src/pages/Marketplace.tsx
import React, { forwardRef, useMemo, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Input,
  Select,
  HStack,
  Skeleton,
  useDisclosure,
  ScaleFade,
  SlideFade,
  InputGroup,
  InputLeftElement,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react';
import { Filter as LucideFilter, Search } from 'lucide-react';
import type { Filter } from '../util/types'; // Adjust the import path as necessary
import { isValidMotionProp, motion } from 'framer-motion';
import { useProducts } from '../hooks/useProduct';
import { ProductCard } from './ProductCard';
import { Product } from '../util/types';
import { FilterDrawer } from './FilterDrawer';
import { useProductFilters } from '../hooks';

const MotionGrid = chakra(
  forwardRef<HTMLDivElement, React.ComponentProps<typeof motion.div>>((props, ref) => <motion.div ref={ref} {...props} />),
  {
    shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
  }
);

export const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { filters, setFilters, applyFilters } = useProductFilters() as unknown as {
    filters: Omit<Filter, 'priceRange'> & { priceRange: [number, number] };
    setFilters: (filters: Omit<Filter, 'priceRange'> & { priceRange: [number, number] }) => void;
    applyFilters: (products: Product[]) => Product[];
  };
  const { products, isLoading } = useProducts();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const filterDrawer = useDisclosure();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return applyFilters(products).filter((product: Product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, filters, searchTerm, selectedCategory, applyFilters]);

  return (
    <Box>
      <SlideFade in offsetY={20}>
        <HStack spacing={4} mb={8}>
          <InputGroup>
            <InputLeftElement>
              <Search className="text-gray-400" />
            </InputLeftElement>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
            />
          </InputGroup>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            bg="white"
            w="200px"
          >
            <option value="all">All Categories</option>
            <option value="fruits">Fruits & Vegetables</option>
            <option value="dairy">Dairy Products</option>
            <option value="meat">Meat & Poultry</option>
            <option value="grains">Grains</option>
          </Select>
          <Box
            as="button"
            onClick={filterDrawer.onOpen}
            p={2}
            borderRadius="md"
            bg="white"
          >
            <LucideFilter />
          </Box>
        </HStack>
      </SlideFade>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="400px" borderRadius="xl" />
          ))}
        </SimpleGrid>
      ) : (
        <MotionGrid
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {filteredProducts?.map((product: Product, index: number) => (
            <ScaleFade in delay={index * 0.1} key={product.id}>
              <ProductCard product={product} onClick={function (): void {
                throw new Error('Function not implemented.');
              } } />
            </ScaleFade>
          ))}
        </MotionGrid>
      )}

      <FilterDrawer
        isOpen={filterDrawer.isOpen}
        onClose={filterDrawer.onClose}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </Box>
  );
};