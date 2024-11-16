// src/components/modals/EditProfileModal.tsx
import React, { useState } from 'react';
import { create } from '@web3-storage/w3up-client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Avatar,
  Center,
  Icon,
} from '@chakra-ui/react';
import { useWeb3 } from '../../contexts/Web3Context';
import { Upload } from 'lucide-react';

// const client = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_TOKEN! });
const client = await create();
await client.login('xusiyi2005@gmail.com');

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    name?: string;
    bio?: string;
    avatar?: string;
  };
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
}) => {
  const { context: { contracts, address } } = useWeb3();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: currentProfile.name || '',
    bio: currentProfile.bio || '',
    avatar: currentProfile.avatar || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    try {
      setIsLoading(true);
      const file = e.target.files[0];
      
      // Upload to Filecoin via web3.storage
      const cid = await client.uploadFile(file);
      
      const imageUrl = `https://${cid}.ipfs.dweb.link/${file.name}`;
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been stored on Filecoin',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error uploading image',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contracts.identity || !address) return;

    setIsLoading(true);
    try {
      const tx = await contracts.identity.updateProfile(
        formData.name,
        formData.bio,
        formData.avatar
      );
      await tx.wait();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 5000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6}>
              <FormControl>
                <Center>
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      as="span"
                      size="lg"
                      borderRadius="full"
                      variant="ghost"
                      cursor="pointer"
                      isLoading={isLoading}
                    >
                      <Avatar
                        size="xl"
                        src={formData.avatar}
                        icon={<Icon as={Upload} />}
                      />
                    </Button>
                  </label>
                </Center>
              </FormControl>

              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};