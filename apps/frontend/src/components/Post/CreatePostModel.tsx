// apps/frontend/src/components/Post/CreatePostModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useForm } from '../../hooks/useForm';
import { useContract } from '../../hooks/useContract';
import { useFilecoinStorage } from '../../hooks/useFilecoinStorage';
import { useToast } from '../../hooks/useToast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { storeData } = useFilecoinStorage();
  const { contract } = useContract();
  const toast = useToast();

  const { formData, handleChange, resetForm } = useForm({
    content: '',
    price: '',
    isBuddyOnly: false,
    image: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store content and image on Filecoin
      const contentCID = await storeData({
        content: formData.content,
        image: formData.image,
        timestamp: Date.now(),
      });

      // Mint NFT
      const tx = await contract.createPost(
        formData.content,
        contentCID,
        formData.isBuddyOnly,
        ethers.utils.parseEther(formData.price || '0'),
      );

      await tx.wait();
      
      toast.success('Post created successfully!');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to create post', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <ModalHeader>Create New Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Content</FormLabel>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                  minH="150px"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image</FormLabel>
                <Input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Price (ETH)</FormLabel>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.0"
                  step="0.001"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">
                  Buddy Only Post
                </FormLabel>
                <Switch
                  name="isBuddyOnly"
                  isChecked={formData.isBuddyOnly}
                  onChange={handleChange}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                w="full"
              >
                Create Post
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};