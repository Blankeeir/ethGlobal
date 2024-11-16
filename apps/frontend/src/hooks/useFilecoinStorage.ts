// src/hooks/useFilecoinStorage.ts

// src/hooks/useFilecoinStorage.ts

import { useState, useCallback, useEffect } from 'react';
import { create, Client } from '@web3-storage/w3up-client';
import { useToast } from '@chakra-ui/react';

interface StorageStatus {
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

interface ChatMessage {
  sender: string;
  recipient: string;
  content: string;
  timestamp: number;
  encrypted?: boolean;
}

interface UserProfile {
  address: string;
  ensName?: string;
  bio?: string;
  avatar?: string;
  buddyStatus: 'verified' | 'pending' | 'none';
  privacyPreferences: {
    showENS: boolean;
    allowDirectMessages: boolean;
    showActivity: boolean;
  };
}

interface EventData {
  id: string;
  name: string;
  description: string;
  category: string;
  startTime: number;
  endTime: number;
  maxParticipants?: number;
  participants: string[];
  isPrivate: boolean;
}

// Type guard for File objects
const isFile = (value: unknown): value is File => {
  return value instanceof File;
};

export const useFilecoinStorage = () => {
  const [status, setStatus] = useState<StorageStatus>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [client, setClient] = useState<Client | null>(null);
  const toast = useToast();

  // Initialize W3UP client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        const w3upClient = await create();
        const space = await w3upClient.createSpace('my-space');
        await w3upClient.setCurrentSpace(space.did());
        setClient(w3upClient);
      } catch (error) {
        console.error('Error initializing W3UP client:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize storage client.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initializeClient();
  }, [toast]);

  // Helper to create a file from JSON data
  const createJsonFile = useCallback((data: ChatMessage[] | UserProfile | EventData | object, filename: string): File => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return new File([blob], filename);
  }, []);

  // Upload a single file or JSON data
  const uploadFile = useCallback(
    async (data: File | object, filename?: string): Promise<string> => {
      if (!client) {
        throw new Error('Storage client is not initialized.');
      }

      setStatus((prev) => ({ ...prev, isUploading: true, error: null }));

      try {
        let file: File;
        if (isFile(data)) {
          file = data;
        } else {
          if (!filename) throw new Error('Filename is required for JSON data');
          file = createJsonFile(data, filename);
        }

        const cid = await client.uploadFile(file);
        setStatus((prev) => ({ ...prev, progress: 100, isUploading: false }));
        return `https://${cid}.ipfs.w3s.link/${file.name}`;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error uploading to Filecoin';
        setStatus((prev) => ({
          ...prev,
          error: new Error(errorMessage),
          isUploading: false,
        }));
        toast({
          title: 'Upload Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        throw error;
      }
    },
    [client, createJsonFile, toast]
  );

  // Store chat messages
  const storeChatMessages = useCallback(
    async (messages: ChatMessage[], threadId: string): Promise<string> => {
      const filename = `chat-${threadId}-${Date.now()}.json`;
      return await uploadFile(messages, filename);
    },
    [uploadFile]
  );

  // Store user profile
  const storeUserProfile = useCallback(
    async (profile: UserProfile): Promise<string> => {
      const filename = `profile-${profile.address}-${Date.now()}.json`;
      return await uploadFile(profile, filename);
    },
    [uploadFile]
  );

  // Store event data
  const storeEventData = useCallback(
    async (event: EventData): Promise<string> => {
      const filename = `event-${event.id}-${Date.now()}.json`;
      return await uploadFile(event, filename);
    },
    [uploadFile]
  );

  // Retrieve data from IPFS
  const retrieveData = useCallback(
    async <T>(cid: string): Promise<T> => {
      try {
        const response = await fetch(`https://${cid}.ipfs.w3s.link`);
        if (!response.ok) {
          throw new Error('Failed to retrieve data from IPFS');
        }
        const data = await response.json();
        return data as T;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error retrieving data from IPFS';
        toast({
          title: 'Retrieval Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        throw error;
      }
    },
    [toast]
  );

  // Batch upload multiple files
  const uploadBatch = useCallback(
    async (
      files: (File | { data: ChatMessage[] | UserProfile | EventData; filename: string })[]
    ): Promise<string[]> => {
      if (!client) {
        throw new Error('Storage client is not initialized.');
      }

      const processedFiles = await Promise.all(
        files.map(async (file) => {
          if (isFile(file)) {
            return file;
          }
          return createJsonFile(file.data, file.filename);
        })
      );

      const cid = await client.uploadDirectory(processedFiles);
      return processedFiles.map(
        (file: { name: string }) => `https://${cid}.ipfs.w3s.link/${file.name}`
      );
    },
    [client, createJsonFile]
  );
  return {
    status,
    uploadFile,
    storeChatMessages,
    storeUserProfile,
    storeEventData,
    retrieveData,
    uploadBatch,
  };
};