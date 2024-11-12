// components/FilterDrawer.tsx
import React, { useState } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
//   Checkbox,
  Radio,
  RadioGroup,
  Button,
  Divider,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FilterIcon, RefreshCcw } from 'lucide-react';
import { Filter } from '../util/types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Filter ) => void;

  currentFilters?: Filter;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {
    priceRange: [0, 1000],
    qualityScore: [0, 100],
    categories: [],
    listingType: 'all',
    carbonFootprint: [0, 100],
    location: '',
    verificationStatus: 'all',
    expiryDateRange: [
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    ],
    sortBy: 'newest'
  }
}) => {
  const [filters, setFilters] = useState({
    priceRange: currentFilters.priceRange || [0, 1000],
    qualityScore: currentFilters.qualityScore || [0, 100],
    categories: currentFilters.categories || [],
    listingType: currentFilters.listingType || 'all',
    carbonFootprint: currentFilters.carbonFootprint || [0, 100],
    location: currentFilters.location || '',
    verificationStatus: currentFilters.verificationStatus || 'all',
    expiryDateRange: currentFilters.expiryDateRange || [
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    ],
    sortBy: currentFilters.sortBy || 'newest'
  });

  const categories = [
    'Fruits & Vegetables',
    'Dairy Products',
    'Meat & Poultry',
    'Grains & Cereals',
    'Seafood',
    'Organic Products'
  ];

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 1000],
      qualityScore: [0, 100],
      categories: [],
      listingType: 'all',
      carbonFootprint: [0, 100],
      location: '',
      verificationStatus: 'all',
      expiryDateRange: [
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
      ],
      sortBy: 'newest'
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack justify="space-between" align="center">
            <HStack>
              <FilterIcon size={20} />
              <Text>Filter Products</Text>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCcw size={16} />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </HStack>
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={6} align="stretch" py={4}>
            {/* Price Range */}
            <Box>
              <FormLabel>Price Range (VET)</FormLabel>
              <HStack>
                <NumberInput
                  value={filters.priceRange[0]}
                  onChange={(_, value) => setFilters(prev => ({
                    ...prev,
                    priceRange: [value, prev.priceRange[1]]
                  }))}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text>to</Text>
                <NumberInput
                  value={filters.priceRange[1]}
                  onChange={(_, value) => setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], value]
                  }))}
                  min={filters.priceRange[0]}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>
            </Box>

            <Divider />

            {/* Categories */}
            <Box>
              <FormLabel>Categories</FormLabel>
              <Wrap spacing={2}>
                {categories.map(category => (
                  <WrapItem key={category}>
                    <Tag
                      size="lg"
                      variant={filters.categories.includes(category) ? "solid" : "outline"}
                      colorScheme="blue"
                      cursor="pointer"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <TagLabel>{category}</TagLabel>
                      {filters.categories.includes(category) && (
                        <TagCloseButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryToggle(category);
                          }}
                        />
                      )}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Divider />

            {/* Listing Type */}
            <Box>
              <FormLabel>Listing Type</FormLabel>
              <RadioGroup
                value={filters.listingType}
                onChange={value => setFilters(prev => ({ ...prev, listingType: value as 'all' | 'fixed' | 'auction' }))}
              >
                <HStack spacing={4}>
                  <Radio value="all">All</Radio>
                  <Radio value="fixed">Fixed Price</Radio>
                  <Radio value="auction">Auction</Radio>
                </HStack>
              </RadioGroup>
            </Box>

            <Divider />

            {/* Quality Score */}
            <Box>
              <FormLabel>Quality Score</FormLabel>
              <RangeSlider
                value={filters.qualityScore}
                onChange={(value: [number, number]) => setFilters(prev => ({ ...prev, qualityScore: value }))}
                min={0}
                max={100}
                step={1}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
              </RangeSlider>
              <HStack justify="space-between">
                <Text fontSize="sm">{filters.qualityScore[0]}%</Text>
                <Text fontSize="sm">{filters.qualityScore[1]}%</Text>
              </HStack>
            </Box>

            <Divider />

            {/* Location */}
            <Box>
              <FormLabel>Location</FormLabel>
              <Input
                placeholder="Enter location"
                value={filters.location}
                onChange={e => setFilters(prev => ({ 
                  ...prev, 
                  location: e.target.value 
                }))}
              />
            </Box>

            <Divider />

            {/* Verification Status */}
            <Box>
              <FormLabel>Verification Status</FormLabel>
              <RadioGroup
                value={filters.verificationStatus}
                onChange={value => setFilters(prev => ({ 
                  ...prev, 
                  verificationStatus: value as 'all' | 'verified' | 'unverified' 
                }))}
              >
                <VStack align="start">
                  <Radio value="all">All</Radio>
                  <Radio value="verified">Verified Only</Radio>
                  <Radio value="unverified">Unverified Only</Radio>
                </VStack>
              </RadioGroup>
            </Box>

            <Divider />

            {/* Sort By */}
            <Box>
              <FormLabel>Sort By</FormLabel>
              <Select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ 
                  ...prev, 
                  sortBy: e.target.value as 'newest' | 'oldest' | 'price_low' | 'price_high' | 'quality_high' | 'expiry_soon'
                }))}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="quality_high">Quality: High to Low</option>
                <option value="expiry_soon">Expiring Soon</option>
              </Select>
            </Box>

            <Box pt={4}>
              <Button
                colorScheme="blue"
                size="lg"
                width="100%"
                onClick={handleApply}
              >
                Apply Filters
              </Button>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};