// src/contexts/PushContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as PushAPI from '@pushprotocol/restapi';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';
import { useWeb3 } from './Web3Context';
import { useToast } from '@chakra-ui/react';
import { type SignTypedDataParameters } from '@wagmi/core'
import { signTypedData } from '@wagmi/core'
import { PushChannel, PushNotification } from '../util/types';



interface PushContextType {
  notifications: PushNotification[];
  subscribedChannels: PushChannel[];
  userPushSDK: any;
  isSubscribed: (channelAddress: string) => Promise<boolean>;
  subscribeToChannel: (channelAddress: string) => Promise<void>;
  unsubscribeFromChannel: (channelAddress: string) => Promise<void>;
  sendNotification: (
    recipient: string,
    title: string,
    message: string,
    cta?: string,
    image?: string,
  ) => Promise<void>;
  optimizeNotificationDelivery: (userActivity: any) => Promise<void>;
  notifyBuddyConnection: (buddyAddress: string) => Promise<void>;
  notifyNewPost: (postId: string, author: string) => Promise<void>;
  notifyEventUpdate: (eventId: string, updateType: string) => Promise<void>;
}

const PushContext = createContext<PushContextType | undefined>(undefined);

export const PushProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { context: { address, signer } } = useWeb3();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<PushChannel[]>([]);
  const [userPushSDK, setUserPushSDK] = useState<any>(null);
  const toast = useToast();

  // Initialize Push Protocol User
  useEffect(() => {
    const initializePush = async () => {
      if (!signer || !address) return;

      try {
        const user = await PushAPI.user.create({
          env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
        });

        setUserPushSDK(user);

        // Fetch initial notifications
        const feeds = await PushAPI.user.getFeeds({
          user: `eip155:1:${address}`, // assuming Ethereum mainnet
          env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
        });

        const formattedNotifications = feeds.map((feed: any) => ({
          id: feed.notificationId,
          title: feed.title,
          message: feed.message,
          cta: feed.cta,
          image: feed.image,
          timestamp: feed.timestamp,
          source: feed.source,
          recipient: feed.recipient,
          status: feed.status
        }));

        setNotifications(formattedNotifications);

        // Fetch subscribed channels
        const subscriptions = await PushAPI.user.getSubscriptions({
          user: `eip155:1:${address}`,
          env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING,
        });

        setSubscribedChannels(subscriptions);
      } catch (error) {
        console.error('Error initializing Push Protocol:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize notifications',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initializePush();
  }, [signer, address, toast]);

  // Check if user is subscribed to a channel
  const isSubscribed = useCallback(async (channelAddress: string): Promise<boolean> => {
    if (!address) return false;

    try {
      const subscribers = await PushAPI.user.getSubscriptions({
        channel: channelAddress,
        user: `eip155:1:${address}`,
        env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
      });

      interface PushSubscriber {
        channel: string;
      }
      
      return (subscribers as PushSubscriber[]).some(sub => 
        sub.channel.toLowerCase() === channelAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }, [address]);

  // Subscribe to a channel
  const subscribeToChannel = useCallback(async (channelAddress: string) => {
    if (!signer || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const pushSigner = {
        getAddress: () => signer.getAddress(),
        signMessage: async (args: { message: string; account: string }) => {
          const signature = await signer.signMessage(args.message);
          return signature.startsWith('0x') ? signature as `0x${string}` : `0x${signature}`;
        },
        signTypedData: async (args: { domain: any; types: any; primaryType: any; message: any; account: any }) => 
          signTypedData(args.domain, { types: args.types, primaryType: args.primaryType, message: args.message }),
        getChainId: () => signer.getChainId(),
        account: address
      };

      await PushAPI.channels.subscribe({
        signer: {
          getAddress: () => signer.getAddress(),
          signMessage: async (args: { message: any; account: any }): Promise<`0x${string}`> => {
            const signature = await signer.signMessage(args.message);
            return signature.startsWith('0x') ? signature as `0x${string}` : `0x${signature}` as `0x${string}`;
          },
          signTypedData: async (args: { domain: any; types: any; primaryType: any; message: any; account: any }) => 
            signTypedData(args.domain, { types: args.types, primaryType: args.primaryType, message: args.message }),
          getChainId: () => signer.getChainId(),
          account: { address }
        },
        
        channelAddress: `eip155:1:${channelAddress}`,
        userAddress: `eip155:1:${address}`,
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully subscribed to channel',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        },
        onError: () => {
          throw new Error('Failed to subscribe to channel');
        },
        env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
      });

      // Refresh subscribed channels
      const subscriptions = await PushAPI.user.getSubscriptions({
        user: `eip155:1:${address}`,
        env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
      });
      setSubscribedChannels(subscriptions);
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe to channel',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [signer, address, toast]);

  // Unsubscribe from a channel
  const unsubscribeFromChannel = useCallback(async (channelAddress: string) => {
    if (!signer || !address) return;

    try {
      const pushSigner = {
        getAddress: () => signer.getAddress(),
        signMessage: async (args: { message: any; account: any }): Promise<`0x${string}`> => {
          const signature = await signer.signMessage(args.message);
          return signature.startsWith('0x') ? signature as `0x${string}` : `0x${signature}` as `0x${string}`;
        },
        signTypedData: async (domain: any, types: any, message: any) => 
          signTypedData(types, message),
        getChainId: () => signer.getChainId(),
        account: address
      };

      await PushAPI.channels.unsubscribe({
        signer: {
          getAddress: () => signer.getAddress(),
          signMessage: async (args: { message: any; account: any }): Promise<`0x${string}`> => {
            const signature = await signer.signMessage(args.message);
            return signature.startsWith('0x') ? signature as `0x${string}` : `0x${signature}` as `0x${string}`;
          },
          signTypedData: async (args: { domain: any; types: any; primaryType: any; message: any; account: any }) => 
            signTypedData(args.domain, { types: args.types, primaryType: args.primaryType, message: args.message }),
          getChainId: () => signer.getChainId(),
          account: { address }
        },
        
        channelAddress: `eip155:1:${channelAddress}`,
        userAddress: `eip155:1:${address}`,
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully unsubscribed from channel',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        },
        onError: () => {
          throw new Error('Failed to unsubscribe from channel');
        },
        env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
      });

      // Refresh subscribed channels
      const subscriptions = await PushAPI.user.getSubscriptions({
        user: `eip155:1:${address}`,
        env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
      });
      setSubscribedChannels(subscriptions);
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from channel',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [signer, address, toast]);

  // Send a notification
  const sendNotification = useCallback(async (
    recipient: string,
    title: string,
    message: string,
    cta?: string,
    image?: string
  ) => {
    if (!signer || !address) return;

    try {
      await PushAPI.payloads.sendNotification({
        signer,
        type: 3, // Target specific user
        identityType: 2, // Direct payload
        notification: {
          title,
          body: message
        },
        payload: {
          title,
          body: message,
          cta: cta || '',
          img: image || ''
        },
        recipients: `eip155:1:${recipient}`,
        channel: `eip155:1:${address}`,
        env: (process.env.REACT_APP_PUSH_ENV as ENV) || ENV.STAGING
      });
      
      toast({
        title: 'Success',
        description: 'Notification sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [signer, address, toast]);

  // Optimize notification delivery based on user activity
  const optimizeNotificationDelivery = useCallback(async (userActivity: any) => {
    // Implement your notification optimization logic here
    // This could include:
    // - Time-based delivery
    // - Priority-based filtering
    // - Activity-based throttling
  }, []);

  // Notify when a buddy connects
  const notifyBuddyConnection = useCallback(async (buddyAddress: string) => {
    await sendNotification(
      buddyAddress,
      'New Buddy Connection',
      'Someone wants to connect with you!',
      '/buddies',
      '/assets/buddy-icon.png'
    );
  }, [sendNotification]);

  // Notify when a new post is created
  const notifyNewPost = useCallback(async (postId: string, author: string) => {
    await sendNotification(
      author,
      'New Post Interaction',
      'Someone interacted with your post!',
      `/posts/${postId}`,
      '/assets/post-icon.png'
    );
  }, [sendNotification]);

  // Notify about event updates
  const notifyEventUpdate = useCallback(async (eventId: string, updateType: string) => {
    await sendNotification(
      'all-subscribers',
      'Event Update',
      `Event ${eventId} has been ${updateType}`,
      `/events/${eventId}`,
      '/assets/event-icon.png'
    );
  }, [sendNotification]);

  return (
    <PushContext.Provider
      value={{
        notifications,
        subscribedChannels,
        userPushSDK,
        isSubscribed,
        subscribeToChannel,
        unsubscribeFromChannel,
        sendNotification,
        optimizeNotificationDelivery,
        notifyBuddyConnection,
        notifyNewPost,
        notifyEventUpdate,
      }}
    >
      {children}
    </PushContext.Provider>
  );
};

export const usePush = () => {
  const context = useContext(PushContext);
  if (context === undefined) {
    throw new Error('usePush must be used within a PushProvider');
  }
  return context;
};