export interface FileWithPreview extends File {
  preview?: string;
}

// components/Dropzone/Dropzone.tsx
import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Box, HStack, Text, VStack, Image, useToast } from "@chakra-ui/react";
import { ScanIcon } from "./Icon";
import { useWallet } from "@vechain/dapp-kit-react";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSize?: number;
  value?: File;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileAccepted,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  maxSize = 5 * 1024 * 1024, // 5MB
  value
}) => {
  const { account } = useWallet();
  const toast = useToast();
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!account) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet first",
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles[0].errors.map(err => err.message).join(", ");
        toast({
          title: "File upload failed",
          description: errors,
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (acceptedFiles.length === 1) {
        const file = acceptedFiles[0];
        
        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
          onFileAccepted(file);
        } catch (error) {
          toast({
            title: "Upload failed",
            description: (error as Error).message,
            status: "error",
            duration: 3000,
          });
        }
      }
    },
    [account, onFileAccepted, toast]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': acceptedFileTypes
    },
    maxSize
  });

  // Cleanup preview on unmount
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <VStack w="full" spacing={4}>
      <Box
        {...getRootProps()}
        p={5}
        border="2px"
        borderColor={
          isDragAccept 
            ? "green.300" 
            : isDragReject 
              ? "red.300" 
              : isDragActive 
                ? "blue.300" 
                : "gray.300"
        }
        borderStyle="dashed"
        borderRadius="md"
        bg={
          isDragAccept 
            ? "green.50" 
            : isDragReject 
              ? "red.50" 
              : isDragActive 
                ? "blue.50" 
                : "gray.50"
        }
        textAlign="center"
        cursor="pointer"
        _hover={{
          borderColor: "blue.500",
          bg: "blue.50",
        }}
        w="full"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <input {...getInputProps()} />
        {preview || value ? (
          <Box position="relative" w="full" h="full">
            <Image
              src={preview || (value instanceof File ? URL.createObjectURL(value) : undefined)}
              alt="Preview"
              objectFit="contain"
              w="full"
              h="full"
            />
            <Text
              position="absolute"
              bottom={2}
              left={0}
              right={0}
              textAlign="center"
              fontSize="sm"
              color="gray.600"
            >
              Click or drag to replace
            </Text>
          </Box>
        ) : (
          <HStack spacing={4}>
            <ScanIcon size={120} color="gray.400" />
            <VStack spacing={2} align="start">
              <Text fontWeight="medium">
                Drop your file here, or click to select
              </Text>
              <Text fontSize="sm" color="gray.500">
                Supports: {acceptedFileTypes.join(", ")}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Max size: {Math.floor(maxSize / 1024 / 1024)}MB
              </Text>
            </VStack>
          </HStack>
        )}
      </Box>
    </VStack>
  );
};
