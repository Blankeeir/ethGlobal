// hooks/useDataService.ts
import { useState } from 'react';
import { useToast } from './useToast';
import { DataService } from '../services/DataService';
import { useFilecoinStorage } from './useFilecoinStorage';
import { usePushNotifications } from './usePushNotifications';

export const useDataService = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { storeData, retrieveData } = useFilecoinStorage();
  const { sendNotification } = usePushNotifications();

  const filecoinService = new FilecoinService(process.env.REACT_APP_WEB3_STORAGE_TOKEN!);
  const PushService = new pushService(window.ethereum);
  const dataService = new DataService(filecoinService, pushService);

  const createPost = async (postData: unknown) => {
    try {
      setLoading(true);
      toast.info('Creating post...', {
        description: 'Please wait while we process your post'
      });

      const post = await dataService.createPost(postData);
      
      toast.success('Post created successfully', {
        description: 'Your post is now visible to others'
      });

      return post;
    } catch (error: unknown) {
      toast.error('Failed to create post', {
        description: (error as Error).message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: unknown) => {
    try {
      setLoading(true);
      toast.info('Creating event...', {
        description: 'Please wait while we process your event'
      });

      const event = await dataService.createEvent(eventData);
      
      toast.success('Event created successfully', {
        description: 'Your event is now visible to others'
      });

      return event;
    } catch (error: any) {
      toast.error('Failed to create event', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    createEvent,
    loading
  };
};