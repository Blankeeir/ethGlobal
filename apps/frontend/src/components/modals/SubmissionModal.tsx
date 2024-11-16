// apps/frontend/src/components/SubmissionModal.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';

import { useSubmission } from '../../hooks/useSubmission';
import { AnimatedContainer } from '../Animations/AnimatedContainer';
import { FormattingUtils } from '@repo/utils';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { [key: string]: string | number | boolean };
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const {
    isLoading,
    error,
    submit,
    clearAll
  } = useSubmission();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async () => {
    try {
      await submit(data);
      onClose();
      clearAll();
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const formatValue = (key: string, value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('price')) {
        return `${value} VET`;
      }
      return value.toString();
    }
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString();
    }
    return value;
  };

  const hoverBgColor = useColorModeValue('gray.50', 'gray.600');

  const renderContent = () => (
    // <AnimatedContainer variant="scale">
      <VStack spacing={4} align="stretch">
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        {Object.entries(data).map(([key, value]) => (
          <HStack
            key={key}
            justifyContent="space-between"
            p={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            _hover={{ bg: hoverBgColor }}
          >
            <Text fontWeight="medium" textTransform="capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </Text>
            <Text>{formatValue(key, value)}</Text>
          </HStack>
        ))}
      </VStack>
    // </AnimatedContainer>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        clearAll();
      }}
      size="lg"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent
        bg={bgColor}
        borderRadius="xl"
        shadow="xl"
      >
        <ModalHeader>Confirm Submission</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          {renderContent()}
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor={borderColor}
          gap={3}
        >
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Submitting"
            leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};