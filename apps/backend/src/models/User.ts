// types/user.ts
export interface UserProfile {
    address: string;
    ensName?: string;
    bio?: string;
    avatar?: string;
    isBuddy: boolean;
    buddyVerificationTime?: number;
    totalPosts: number;
    totalLikes: number;
    totalConnections: number;
    specialties?: string[];
    rating?: number;
    metadata?: Record<string, any>;
  }
  
  interface UserStats {
    posts: number;
    likes: number;
    connections: number;
    dateRange: {
      today: number;
      week: number;
    };
  }
  