// // apps/frontend/src/components/Feed/FeedPage.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   VStack,
//   HStack,
//   Input,
//   Select,
//   IconButton,
//   useDisclosure,
//   useColorModeValue,
//   Text,
//   Badge,
//   Button,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
// } from '@chakra-ui/react';
// import { FiFilter, FiSearch, FiGrid, FiList, FiTrendingUp } from 'react-icons/fi';
// import { motion, AnimatePresence } from 'framer-motion';
// import { NFTCardGrid } from '../Post/NFTCardGrid';
// import { CreatePostModal } from '../modals/CreatePostModal';
// import { FilterDrawer } from '../FilterDrawer';
// import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
// import { useNFTPosts } from '../../hooks/useNFTPosts';

// const MotionBox = chakra(motion.div, {
//   shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
// });

// export const FeedPage = () => {
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [sortBy, setSortBy] = useState('recent');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
//   const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  
//   const { 
//     posts, 
//     loading, 
//     fetchPosts,
//     likePost,
//     commentOnPost,
//     sharePost,
//     buyPost 
//   } = useNFTPosts();

//   const { shouldRender, controls } = useAnimatedMount(true);
//   const bgColor = useColorModeValue('white', 'gray.800');

//   const filterPosts = () => {
//     return posts.filter(post => {
//       const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           post.author.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
//       return matchesSearch && matchesCategory;
//     });
//   };

//   const sortPosts = (filtered: any[]) => {
//     switch (sortBy) {
//       case 'trending':
//         return [...filtered].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
//       case 'price-high':
//         return [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//       case 'price-low':
//         return [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//       default:
//         return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
//     }
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//   };

//   const filteredAndSortedPosts = sortPosts(filterPosts());

//   return (
//     <AnimatePresence>
//       {shouldRender && (
//         <MotionBox
//           initial={{ opacity: 0 }}
//           animate={controls}
//           exit={{ opacity: 0 }}
//           maxW="7xl"
//           mx="auto"
//           px={4}
//           py={8}
//         >
//           {/* Header Section */}
//           <VStack spacing={6} w="full">
//             <HStack justify="space-between" w="full" wrap="wrap" spacing={4}>
//               <Box flex={1} minW="300px">
//                 <Input
//                   placeholder="Search posts..."
//                   value={searchQuery}
//                   onChange={handleSearch}
//                   bg={bgColor}
//                   leftIcon={<FiSearch />}
//                 />
//               </Box>
              
//               <HStack spacing={4}>
//                 <IconButton
//                   aria-label="Toggle view"
//                   icon={viewMode === 'grid' ? <FiList /> : <FiGrid />}
//                   onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
//                 />
                
//                 <Menu>
//                   <MenuButton as={Button} rightIcon={<FiTrendingUp />}>
//                     Sort By
//                   </MenuButton>
//                   <MenuList>
//                     <MenuItem onClick={() => setSortBy('recent')}>Most Recent</MenuItem>
//                     <MenuItem onClick={() => setSortBy('trending')}>Trending</MenuItem>
//                     <MenuItem onClick={() => setSortBy('price-high')}>Price: High to Low</MenuItem>
//                     <MenuItem onClick={() => setSortBy('price-low')}>Price: Low to High</MenuItem>
//                   </MenuList>
//                 </Menu>

//                 <Button colorScheme="blue" onClick={onCreateOpen}>
//                   Create Post
//                 </Button>

//                 <IconButton
//                   aria-label="Filters"
//                   icon={<FiFilter />}
//                   onClick={onFilterOpen}
//                 />
//               </HStack>
//             </HStack>

//             {/* Category Tags */}
//             <HStack spacing={2} overflowX="auto" w="full" py={2}>
//               {['all', 'mental-health', 'support', 'motivation', 'community'].map((category) => (
//                 <Badge
//                   key={category}
//                   px={3}
//                   py={1}
//                   borderRadius="full"
//                   cursor="pointer"
//                   bg={selectedCategory === category ? 'blue.500' : bgColor}
//                   color={selectedCategory === category ? 'white' : 'inherit'}
//                   onClick={() => setSelectedCategory(category)}
//                   _hover={{ opacity: 0.8 }}
//                   transition="all 0.2s"
//                 >
//                   {category.charAt(0).toUpperCase() + category.slice(1)}
//                 </Badge>
//               ))}
//             </HStack>

//             {/* Stats Section */}
//             <HStack justify="space-between" w="full" bg={bgColor} p={4} rounded="lg">
//               <Text>
//                 Showing {filteredAndSortedPosts.length} posts
//               </Text>
//               <HStack spacing={4}>
//                 <Badge colorScheme="green">
//                   {posts.filter(p => p.isBuddyOnly).length} Buddy Only Posts
//                 </Badge>
//                 <Badge colorScheme="purple">
//                   {posts.filter(p => parseFloat(p.price) > 0).length} NFTs for Sale
//                 </Badge>
//               </HStack>
//             </HStack>

//             {/* Posts Grid/List */}
//             <NFTCardGrid
//               posts={filteredAndSortedPosts}
//               loading={loading}
//               viewMode={viewMode}
//               onLike={likePost}
//               onComment={commentOnPost}
//               onShare={sharePost}
//               onBuy={buyPost}
//             />
//           </VStack>

//           {/* Modals and Drawers */}
//           <CreatePostModal
//             isOpen={isCreateOpen}
//             onClose={onCreateClose}
//             onSuccess={fetchPosts}
//           />

//           <FilterDrawer
//             isOpen={isFilterOpen}
//             onClose={onFilterClose}
//             onFilter={(filters) => {
//               // Handle filtering logic
//             }}
//           />
//         </MotionBox>
//       )}
//     </AnimatePresence>
//   );
// };