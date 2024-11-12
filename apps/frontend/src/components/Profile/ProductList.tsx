// // apps/frontend/src/components/Profile/ProductsList.tsx
// import React from 'react';
// import {
//   SimpleGrid,
//   Box,
//   Text,
//   Badge,
//   // Button,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   IconButton,
//   // useDisclosure,
//   shouldForwardProp,
// } from '@chakra-ui/react';
// import { MoreVertical, Edit, Trash, Eye } from 'lucide-react';
// import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion';
// import { CardSkeleton } from '../Loading/CardSkeleton';
// import { useToast } from '@chakra-ui/react';
// import { useVeChain } from '../../hooks/useVeChain';
// // import { Profile } from '../../util/types';

// import { chakra } from '@chakra-ui/react';

// const MotionBox = chakra(motion.div, {
//   shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
// });

// interface Product {
//   id: string;
//   name: string;
//   status: 'active' | 'sold' | 'expired';
//   price: number;
//   quantity: number;
//   createdAt: string;
// }

// export const ProductsList: React.FC<{ products?: Product[] }> = ({ products }) => {
//   const toast = useToast();
//   const { sendTransaction } = useVeChain();

//   const handleDelete = async () => {
//     try {
//       await sendTransaction({
//         length: 0,
//         pop: function (): (Connex.VM.Clause & { comment?: string; abi?: object; }) | undefined {
//           throw new Error('Function not implemented.');
//         },
//         push: function (): number {
//           throw new Error('Function not implemented.');
//         },
//         concat: function (): (Connex.VM.Clause & { comment?: string; abi?: object; })[] {
//           throw new Error('Function not implemented.');
//         },
//         join: function (): string {
//           throw new Error('Function not implemented.');
//         },
//         reverse: function (): (Connex.VM.Clause & { comment?: string; abi?: object; })[] {
//           throw new Error('Function not implemented.');
//         },
//         shift: function (): (Connex.VM.Clause & { comment?: string; abi?: object; }) | undefined {
//           throw new Error('Function not implemented.');
//         },
//         slice: function (): (Connex.VM.Clause & { comment?: string; abi?: object; })[] {
//           throw new Error('Function not implemented.');
//         },
//         sort: function (compareFn?: ((a: Connex.VM.Clause & { comment?: string; abi?: object; }, b: Connex.VM.Clause & { comment?: string; abi?: object; }) => number) | undefined): Connex.Vendor.TxMessage {
//           throw new Error('Function not implemented.');
//         },
//         splice: function (): (Connex.VM.Clause & { comment?: string; abi?: object; })[] {
//           throw new Error('Function not implemented.');
//         },
//         unshift: function (): number {
//           throw new Error('Function not implemented.');
//         },
//         indexOf: function (): number {
//           throw new Error('Function not implemented.');
//         },
//         lastIndexOf: function (): number {
//           throw new Error('Function not implemented.');
//         },
//         every: function <S extends Connex.VM.Clause & { comment?: string; abi?: object; }>(predicate: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => value is S, thisArg?: any): this is S[] {
//           throw new Error('Function not implemented.');
//         },
//         some: function (predicate: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => unknown, thisArg?: any): boolean {
//           throw new Error('Function not implemented.');
//         },
//         forEach: function (callbackfn: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => void, thisArg?: any): void {
//           throw new Error('Function not implemented.');
//         },
//         map: function <U>(callbackfn: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => U, thisArg?: any): U[] {
//           throw new Error('Function not implemented.');
//         },
//         filter: function <S extends Connex.VM.Clause & { comment?: string; abi?: object; }>(predicate: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => value is S, thisArg?: any): S[] {
//           throw new Error('Function not implemented.');
//         },
//         reduce: function (callbackfn: (previousValue: Connex.VM.Clause & { comment?: string; abi?: object; }, currentValue: Connex.VM.Clause & { comment?: string; abi?: object; }, currentIndex: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => Connex.VM.Clause & { comment?: string; abi?: object; }): Connex.VM.Clause & { comment?: string; abi?: object; } {
//           throw new Error('Function not implemented.');
//         },
//         reduceRight: function (callbackfn: (previousValue: Connex.VM.Clause & { comment?: string; abi?: object; }, currentValue: Connex.VM.Clause & { comment?: string; abi?: object; }, currentIndex: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => Connex.VM.Clause & { comment?: string; abi?: object; }): Connex.VM.Clause & { comment?: string; abi?: object; } {
//           throw new Error('Function not implemented.');
//         },
//         find: function <S extends Connex.VM.Clause & { comment?: string; abi?: object; }>(predicate: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, obj: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => value is S, thisArg?: any): S | undefined {
//           throw new Error('Function not implemented.');
//         },
//         findIndex: function (predicate: (value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, obj: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => unknown, thisArg?: any): number {
//           throw new Error('Function not implemented.');
//         },
//         fill: function (): Connex.Vendor.TxMessage {
//           throw new Error('Function not implemented.');
//         },
//         copyWithin: function (): Connex.Vendor.TxMessage {
//           throw new Error('Function not implemented.');
//         },
//         entries: function (): ArrayIterator<[number, Connex.VM.Clause & { comment?: string; abi?: object; }]> {
//           throw new Error('Function not implemented.');
//         },
//         keys: function (): ArrayIterator<number> {
//           throw new Error('Function not implemented.');
//         },
//         values: function (): ArrayIterator<Connex.VM.Clause & { comment?: string; abi?: object; }> {
//           throw new Error('Function not implemented.');
//         },
//         includes: function (): boolean {
//           throw new Error('Function not implemented.');
//         },
//         flatMap: function <U, This = undefined>(callback: (this: This, value: Connex.VM.Clause & { comment?: string; abi?: object; }, index: number, array: (Connex.VM.Clause & { comment?: string; abi?: object; })[]) => U | readonly U[], thisArg?: This | undefined): U[] {
//           throw new Error('Function not implemented.');
//         },
//         flat: function <A>(): FlatArray<A, 1>[] {
//           throw new Error('Function not implemented.');
//         },
//         [Symbol.iterator]: function (): ArrayIterator<Connex.VM.Clause & { comment?: string; abi?: object; }> {
//           throw new Error('Function not implemented.');
//         },
//         [Symbol.unscopables]: undefined,
//         at: function (): (Connex.VM.Clause & { comment?: string; abi?: object; }) | undefined {
//           throw new Error('Function not implemented.');
//         }
//       });
//       toast({
//         title: 'Product deleted',
//         status: 'success',
//         duration: 3000,
//       });
//     } catch (error) {
//       toast({
//         title: 'Failed to delete product',
//         status: 'error',
//         duration: 3000,
//       });
//     }
//   };

//   if (!products) {
//     return (
//       <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
//         {[...Array(6)].map((_, i) => (
//           <CardSkeleton key={i} />
//         ))}
//       </SimpleGrid>
//     );
//   }

//   return (
//     <AnimatePresence>
//       <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
//         {products.map((product, index) => (
//           <MotionBox
//             key={product.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.3, delay: index * 0.1 } as any}
//           >
//             <Box
//               bg="white"
//               p={6}
//               borderRadius="xl"
//               shadow="md"
//               position="relative"
//             >
//               <Menu>
//                 <MenuButton
//                   as={IconButton}
//                   icon={<MoreVertical size={20} />}
//                   variant="ghost"
//                   size="sm"
//                   position="absolute"
//                   top={4}
//                   right={4}
//                 />
//                 <MenuList>
//                   <MenuItem icon={<Edit size={16} />}>Edit</MenuItem>
//                   <MenuItem icon={<Eye size={16} />}>View Details</MenuItem>
//                   <MenuItem 
//                     icon={<Trash size={16} />} 
//                     color="red.500"
//                     onClick={handleDelete}
//                   >
//                     Delete
//                   </MenuItem>
//                 </MenuList>
//               </Menu>

//               <Text fontSize="lg" fontWeight="bold" mb={2}>
//                 {product.name}
//               </Text>

//               <Badge
//                 colorScheme={
//                   product.status === 'active' ? 'green' :
//                   product.status === 'sold' ? 'blue' : 'red'
//                 }
//                 mb={4}
//               >
//                 {product.status}
//               </Badge>

//               <Text fontSize="sm" color="gray.600" mb={2}>
//                 Price: {product.price} VET
//               </Text>

//               <Text fontSize="sm" color="gray.600" mb={4}>
//                 Quantity: {product.quantity}
//               </Text>

//               <Text fontSize="xs" color="gray.500">
//                 Listed on: {new Date(product.createdAt).toLocaleDateString()}
//               </Text>
//             </Box>
//           </MotionBox>
//         ))}
//       </SimpleGrid>
//     </AnimatePresence>
//   );
// };