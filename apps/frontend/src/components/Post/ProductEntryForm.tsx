// components/ProductEntryForm.tsx
import React, { useState } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  // Icon,
  // useColorModeValue,
  // Button,
  Box,
  // shouldForwardProp,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { chakra } from '@chakra-ui/react';

// Import your actual hooks and constants
import { useVeChain } from '../../hooks/useVeChain';
import { useToast } from '../../hooks/useToast';
import { useTransactions } from '../../hooks/useTransactions';
import { useContract } from '../../hooks/useContract';
// import { AnimatedContainer } from '../Animations/AnimatedContainer';
import { Dropzone } from '../Dropzone';
import { SERVARE_NFT_ADDRESS } from '../../const';
import { Product as ProductFormData } from '../../util/types';
import {uploadToIPFS} from '../../util/ipfs';
import { productSchema } from '../../schemas';



// const MotionVStack = chakra(motion.div, {
//   shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
// });
import { forwardRef } from 'react';
import ServareNFTABI from '../../../../contracts/abi/SurfoodNFT.json';
// import SupplyChainTrackingAbi from '../../../contracts/abi/SupplyChainTracking.json';
import { AbiItem } from 'web3-utils';
const MotionButton = motion(forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'> & { colorScheme?: string, size?: string }>((props, ref) => <chakra.button ref={ref} {...props} />));

export const ProductEntryForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsUploading] = useState(false);
  const toast = useToast();
  const { handleTransaction } = useTransactions();
  const { account } = useVeChain();

  const nftContract = useContract('ServareNFT', SERVARE_NFT_ADDRESS, ServareNFTABI.abi as AbiItem[]);
  // const bgColor = useColorModeValue('white', 'gray.700');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    // setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      quantity: 1,
      price: 0,
      carbonFootprint: 0,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!nftContract) {
      toast.error('Contract not initialized');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploading(true);

      // Upload image to IPFS
      const imageHash = await uploadToIPFS(data.imageUrl);
      if (!imageHash) {
        throw new Error('Failed to upload image to IPFS');
      }

      // Create metadata
      const metadata = {
        name: data.name,
        description: data.description,
        image: `ipfs://${imageHash}`,
        attributes: {
          quantity: data.quantity,
          location: data.location,
          category: data.category,
          carbonFootprint: data.carbonFootprint,
          expiryDate: data.expiryDate.toString(),
          productionDate: data.productionDate.toString(),
        },
      };

      setIsUploading(false);

      // Upload metadata to IPFS
      const metadataHash = await uploadToIPFS(JSON.stringify(metadata));
      if (!metadataHash) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      // Create product on blockchain
      const transaction = nftContract.methods.createProduct(
        data.name,
        data.description,
        data.quantity,
        data.location,
        Math.floor(new Date(data.expiryDate).getTime() / 1000),
        Math.floor(new Date(data.productionDate).getTime() / 1000),
        data.category,
        `ipfs://${imageHash}`,
        data.price,
        metadataHash,
        data.carbonFootprint
      );

      await handleTransaction({ send: () => transaction }, {
        pendingMessage: 'Creating product on blockchain...',
        successMessage: 'Product created successfully!',
        errorMessage: 'Failed to create product',
        onSuccess: () => {
          reset();
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to create product', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    // <AnimatedContainer
    //   variant="scale"
    //   bg={bgColor}
    //   p={8}
    //   borderRadius="xl"
    //   shadow="lg"
    //   maxW="3xl"
    //   mx="auto"
    //   initial={{ opacity: 0, scale: 0.95 }}
    //   animate={{ opacity: 1, scale: 1 }}
    //   style={{ transition: 'all 0.3s' }}
    // >
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 } as { duration: number; delay: number }}
        >
          <VStack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold">Create New Product</Text>

          {/* Basic Information */}
          <HStack width="full" spacing={4}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Product Name</FormLabel>
                  <Input {...field} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.category}>
                  <FormLabel>Category</FormLabel>
                  <Select {...field}>
                    <option value="">Select category</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                    <option value="grains">Grains</option>
                  </Select>
                  <FormErrorMessage>{errors.category?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </HStack>

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea {...field} rows={4} resize="vertical" />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          {/* Quantity and Price */}
          <HStack width="full" spacing={4}>
            <Controller
              name="quantity"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors.quantity}>
                  <FormLabel>Quantity</FormLabel>
                  <NumberInput
                    value={value}
                    onChange={(_, valueAsNumber) => onChange(valueAsNumber)}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="price"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>Price (VET)</FormLabel>
                  <NumberInput
                    value={value}
                    onChange={(_, valueAsNumber) => onChange(valueAsNumber)}
                    min={0}
                    precision={3}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </HStack>

          {/* Dates */}
          <HStack width="full" spacing={4}>
            <Controller
              name="productionDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors.productionDate}>
                  <FormLabel>Production Date</FormLabel>
                  <Input
                    type="date"
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange(new Date(e.target.value))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <FormErrorMessage>{errors.productionDate?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="expiryDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors.expiryDate}>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input
                    type="date"
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange(new Date(e.target.value))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <FormErrorMessage>{errors.expiryDate?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </HStack>

          {/* Location and Carbon Footprint */}
          <HStack width="full" spacing={4}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.location}>
                  <FormLabel>Location</FormLabel>
                  <Input {...field} />
                  <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="carbonFootprint"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors.carbonFootprint}>
                  <FormLabel>Carbon Footprint (kg CO2)</FormLabel>
                  <NumberInput
                    value={value}
                    onChange={(_, valueAsNumber) => onChange(valueAsNumber)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.carbonFootprint?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </HStack>

          {/* Image Upload */}
          <Controller
            name="imageUrl"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl isInvalid={!!errors.imageUrl}>
                <FormLabel>Product Image</FormLabel>
                <Dropzone
                  onFileAccepted={(file) => onChange(file)}
                  maxSize={5000000}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                  value={value as unknown as File}
                />
                <FormErrorMessage>{errors.imageUrl?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          {/* Submit Button */}
          {/* Submit Button */}
          <Box width="full">
            <MotionButton
              type="submit"
              colorScheme="blue"
              size="lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
    
            >
              {isSubmitting ? 'Creating Product...' : 'Create Product'}
            </MotionButton>
          </Box>
          </VStack>
        </motion.div>
      </form>
    // </AnimatedContainer>
  );
};