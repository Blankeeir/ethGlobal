// services/DataService.ts
import { FilecoinService } from './filecoin.service';
import { PushService } from './push.service';

interface PostData {
  id: string;
  content: string;
  imageURI?: string;
  author: string;
  timestamp: number;
  category?: string;
  contentCID?: string;
}

interface EventData {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  category: string;
  requiresIdentity: boolean;
  participants: string[];
}

export class DataService {
  private filecoinService: FilecoinService;
  private pushService: PushService;
  
  constructor(filecoinService: FilecoinService, pushService: PushService) {
    this.filecoinService = filecoinService;
    this.pushService = pushService;
  }

  async createPost(post: PostData) {
    try {
      // Store post content on Filecoin
      const contentCID = await this.filecoinService.storeJSON({
        content: post.content,
        imageURI: post.imageURI,
        timestamp: Date.now()
      });

      // Store post metadata on-chain
      const postWithCID = {
        ...post,
        contentCID
      };

      // Notify followers
      await this.pushService.sendNotification({
        recipient: post.author,
        title: 'New Post Created',
        body: `Your post has been created successfully`,
        type: 'post_created',
        payload: { postId: post.id },
        channel: process.env.REACT_APP_PUSH_CHANNEL_ADDRESS!
      });

      return postWithCID;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async createEvent(event: EventData) {
    try {
      // Store event data on Filecoin
      const contentCID = await this.filecoinService.storeJSON({
        ...event,
        createdAt: Date.now()
      });

      // Notify relevant users
      await this.pushService.sendNotification({
        recipient: event.participants[0], // Creator
        title: 'Event Created',
        body: `Your event "${event.name}" has been created`,
        type: 'event_created',
        payload: { eventId: event.id },
        channel: process.env.REACT_APP_PUSH_CHANNEL_ADDRESS!
      });

      return { ...event, contentCID };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getPostContent(contentCID: string) {
    try {
      return await this.filecoinService.retrieveJSON(contentCID);
    } catch (error) {
      console.error('Error retrieving post content:', error);
      throw error;
    }
  }

  async getEventData(contentCID: string) {
    try {
      return await this.filecoinService.retrieveJSON(contentCID);
    } catch (error) {
      console.error('Error retrieving event data:', error);
      throw error;
    }
  }
}
