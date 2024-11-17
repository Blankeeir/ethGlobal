// src/components/Post/CreatePostModal.tsx
import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Switch,
  useColorModeValue,
  Text,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { useFilecoinStorage } from '../../hooks/useFilecoinStorage';
import { useToast } from '@chakra-ui/react';
import { Dropzone } from '../Post/Dropzone';
import { utils } from 'ethers';
import {parseEther} from 'ethers/lib/utils';


interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  content: string;
  price: string;
  isBuddyOnly: boolean;
  image: File | undefined;
}

interface FormErrors {
  content?: string;
  price?: string;
  image?: string;
}

const MAX_CONTENT_LENGTH = 1000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    content: '',
    price: '0',
    isBuddyOnly: false,
    image: undefined,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const { eventContract, address } = useWeb3();
  const { uploadFile } = useFilecoinStorage();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Content must be less than ${MAX_CONTENT_LENGTH} characters`;
    }

    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Price must be a positive number';
    }

    if (formData.image) {
      if (formData.image.size > MAX_IMAGE_SIZE) {
        newErrors.image = 'Image size must be less than 5MB';
      }
      if (!SUPPORTED_IMAGE_TYPES.includes(formData.image.type)) {
        newErrors.image = 'Only JPEG, PNG, and WebP images are supported';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handlePriceChange = (_: string, valueAsNumber: number) => {
    setFormData(prev => ({
      ...prev,
      price: valueAsNumber.toString(),
    }));
  };

  const handleImageAccepted = (file: File) => {
    setFormData(prev => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !eventContract?.postNFT) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload image to Filecoin if present
      let imageCID = '';
      if (formData.image) {
        imageCID = await uploadFile(formData.image, `post-image-${Date.now()}`);
      }

      // Prepare post data
      const postData = {
        content: formData.content,
        imageUri: imageCID,
        timestamp: Date.now(),
        author: address,
      };

      // Upload post data to Filecoin
      const postCID = await uploadFile(
        postData,
        `post-${Date.now()}.json`
      );

      // Create post on-chain
      const tx = await eventContract?.postNFT.createPost(
        postCID,
        utils.parseEther(formData.price || '0'),
        formData.isBuddyOnly
      );

      await tx.wait();
      
      toast({
        title: 'Success',
        description: 'Post created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      content: '',
      price: '0',
      isBuddyOnly: false,
      image: undefined,
    });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
          <ModalOverlay />
          <ModalContent
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            bg={bgColor}
            borderColor={borderColor}
            borderWidth="1px"
          >
            <ModalHeader>Create New Post</ModalHeader>
            <ModalCloseButton />
            
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.content}>
                    <FormLabel>Content</FormLabel>
                    <Textarea
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="Share your thoughts..."
                      minH="150px"
                      maxLength={MAX_CONTENT_LENGTH}
                    />
                    <Text
                      fontSize="sm"
                      color={formData.content.length > MAX_CONTENT_LENGTH ? 'red.500' : 'gray.500'}
                      textAlign="right"
                      mt={1}
                    >
                      {formData.content.length}/{MAX_CONTENT_LENGTH}
                    </Text>
                    <FormErrorMessage>{errors.content}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.image}>
                    <FormLabel>Image</FormLabel>
                    <Dropzone
                      onFileAccepted={handleImageAccepted}
                      acceptedFileTypes={SUPPORTED_IMAGE_TYPES}
                      maxSize={MAX_IMAGE_SIZE}
                      value={formData.image}
                    />
                    <FormErrorMessage>{errors.image}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.price}>
                    <FormLabel>Price (ETH)</FormLabel>
                    <NumberInput
                      value={formData.price}
                      onChange={handlePriceChange}
                      min={0}
                      precision={6}
                      step={0.000001}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.price}</FormErrorMessage>
                  </FormControl>

                  <HStack w="full" justify="space-between">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="buddy-only" mb="0">
                        Buddy Only Post
                      </FormLabel>
                      <Switch
                        id="buddy-only"
                        isChecked={formData.isBuddyOnly}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            isBuddyOnly: e.target.checked,
                          }))
                        }
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Creating..."
                >
                  Create Post
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};