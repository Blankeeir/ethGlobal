// src/hooks/usePushProtocol.ts
import { useEffect, useState } from 'react';
import * as PushAPI from '@pushprotocol/restapi';
import { NotificationItem } from '@pushprotocol/uiweb';
import { useAccount } from 'wagmi';

export const usePushProtocol = () => {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pushUser, setPushUser] = useState<PushAPI.IUser | null>(null);

  const initializePush = async () => {
    if (!address) return;
    
    try {
      // Initialize user
      const user = await PushAPI.user.get({
        account: `eip155:${address}`,
      });

      if (!user) {
        // Create new user if doesn't exist
        await PushAPI.user.create({
          account: address,
        });
      }

      setPushUser(user);
      
      // Subscribe to default channel
      await PushAPI.channels.subscribe({
        signer: address,
        channelAddress: 'eip155:5:0xYourChannelAddress', // Your app's channel
        userAddress: `eip155:${address}`,
        onSuccess: () => console.log('Subscribed to channel'),
        onError: () => console.error('Error subscribing to channel'),
      });

      // Fetch notifications
      await fetchNotifications();
    } catch (err) {
      console.error('Error initializing Push Protocol:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!address) return;
    
    try {
      const notifications = await PushAPI.user.getFeeds({
        user: `eip155:${address}`,
        spam: false,
      });
      
      setNotifications(notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const sendNotification = async (recipient: string, title: string, body: string) => {
    try {
      await PushAPI.payloads.sendNotification({
        signer: address,
        type: 1, // broadcast
        identityType: 2, // direct payload
        notification: {
          title,
          body
        },
        payload: {
          title,
          body,
          cta: '',
          img: ''
        },
        recipients: `eip155:5:${recipient}`,
        channel: 'eip155:5:0xYourChannelAddress',
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  useEffect(() => {
    if (address) {
      initializePush();
    }
  }, [address]);

  return {
    notifications,
    sendNotification,
    fetchNotifications,
  };
};