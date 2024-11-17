// frontend/src/util/types

export interface Buddy {
  id: string;
  ensName: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  address: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  creator: string;
  requiresIdentity: boolean;
  participants: string[];
  category: string;
  chainId: number;
  filecoinCID?: string;
  createdAt: number;
}

export interface Post {
  id: string;
  content: string;
  imageURI?: string;
  author: string;
  timestamp: number;
  category?: string;
  contentCID?: string;
}

export interface EventFilters {
  category?: string;
  requiresIdentity?: boolean;
  timeRange?: 'upcoming' | 'ongoing' | 'past';
}

export interface StorageStatus {
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export interface message {
  sender: string;
  recipient: string;
  content: string;
  timestamp: number;
  encrypted?: boolean;
}

export interface UserProfile {
  address: string;
  ensName?: string;
  username?: string;
  email?: string;
  
  bio?: string;
  avatar?: string;
  buddyStatus: 'verified' | 'pending' | 'none';
  privacyPreferences: {
    showENS: boolean;
    allowDirectMessages: boolean;
    showActivity: boolean;
  };
  settings: {
    notifications: boolean;
    emailUpdates: boolean;
  };


}

export interface NFTPostCard {

    tokenId: string;
  
    content: string;
  
    imageUri: string;
  
    author: string;
  
    likes: number;
  
    comments: number;
  
    price?: string;
  
    isLiked?: boolean;
  
    onLike?: () => void;
  
    onComment?: (post: Post, comment: string) => Promise<void>;
  
    onShare?: () => void;
  
    onBuy?: () => void;
  
  }
  


export interface EventData {
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



export interface PushNotification {
  id: string;
  title: string;
  message: string;
  cta: string;
  image: string;
  timestamp: number;
  source: string;
  recipient: string;
  status: string;
}

export interface PushChannel {
  channelAddress: string;
  name: string;
  icon: string;
  subscribers: number;
}