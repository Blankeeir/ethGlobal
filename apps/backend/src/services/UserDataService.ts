// services/UserDataService.ts
import { ethers } from 'ethers';
import { FilecoinService } from './FilecoinService';
import { PushService } from './PushService';
import { ENSService } from './ENSService';
import { BuddySystemContract } from '../contracts/BuddySystem';
import { PostNFTContract } from '../contracts/PostNFT';
import { UserProfile, UserStats } from '../types/user';

export class UserDataService {
  private filecoinService: FilecoinService;
  private pushService: PushService;
  private ensService: ENSService;
  private buddyContract: BuddySystemContract;
  private postContract: PostNFTContract;
  private provider: ethers.providers.Provider;

  constructor(
    filecoinService: FilecoinService,
    pushService: PushService,
    ensService: ENSService,
    buddyContract: BuddySystemContract,
    postContract: PostNFTContract,
    provider: ethers.providers.Provider
  ) {
    this.filecoinService = filecoinService;
    this.pushService = pushService;
    this.ensService = ensService;
    this.buddyContract = buddyContract;
    this.postContract = postContract;
    this.provider = provider;
  }

  async getUserStats(address: string): Promise<UserStats> {
    try {
      // Fetch all stats in parallel
      const [
        posts,
        likes,
        connections,
        todayConnections,
        weekConnections
      ] = await Promise.all([
        this.getTotalPosts(address),
        this.getTotalLikes(address),
        this.getTotalConnections(address),
        this.getConnectionsToday(address),
        this.getConnectionsThisWeek(address)
      ]);

      return {
        posts,
        likes,
        connections,
        dateRange: {
          today: todayConnections,
          week: weekConnections
        }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getTotalPosts(address: string): Promise<number> {
    try {
      // Query PostNFT contract for user's posts
      const filter = this.postContract.filters.PostCreated(null, address);
      const events = await this.postContract.queryFilter(filter);
      return events.length;
    } catch (error) {
      console.error('Error fetching total posts:', error);
      throw error;
    }
  }

  async getTotalLikes(address: string): Promise<number> {
    try {
      // Query PostNFT contract for likes on user's posts
      let totalLikes = 0;
      const userPosts = await this.postContract.getUserPosts(address);
      
      for (const postId of userPosts) {
        const postData = await this.postContract.posts(postId);
        totalLikes += postData.likes.toNumber();
      }
      
      return totalLikes;
    } catch (error) {
      console.error('Error fetching total likes:', error);
      throw error;
    }
  }

  async getTotalConnections(address: string): Promise<number> {
    try {
      // Query BuddySystem contract for total connections
      const buddyData = await this.buddyContract.buddies(address);
      return buddyData.totalConnections.toNumber();
    } catch (error) {
      console.error('Error fetching total connections:', error);
      throw error;
    }
  }

  async getConnectionsToday(address: string): Promise<number> {
    try {
      const startOfDay = Math.floor(Date.now() / 86400000) * 86400000;
      const filter = this.buddyContract.filters.ConnectionMade(address, null);
      const events = await this.buddyContract.queryFilter(filter);
      
      return events.filter(event => {
        const block = await this.provider.getBlock(event.blockNumber);
        return block.timestamp * 1000 >= startOfDay;
      }).length;
    } catch (error) {
      console.error('Error fetching today\'s connections:', error);
      throw error;
    }
  }

  async getConnectionsThisWeek(address: string): Promise<number> {
    try {
      const startOfWeek = Math.floor(Date.now() / 604800000) * 604800000;
      const filter = this.buddyContract.filters.ConnectionMade(address, null);
      const events = await this.buddyContract.queryFilter(filter);
      
      return events.filter(event => {
        const block = await this.provider.getBlock(event.blockNumber);
        return block.timestamp * 1000 >= startOfWeek;
      }).length;
    } catch (error) {
      console.error('Error fetching week\'s connections:', error);
      throw error;
    }
  }

  async updateProfile(address: string, data: Partial<UserProfile>): Promise<string> {
    try {
      // Store profile data on Filecoin
      const cid = await this.filecoinService.storeJSON({
        ...data,
        address,
        updatedAt: Date.now()
      });

      // Update ENS if name is provided
      if (data.ensName) {
        await this.ensService.setReverseName(address, data.ensName);
      }

      // Update on-chain profile reference in BuddySystem contract
      if (this.buddyContract.updateProfile) {
        await this.buddyContract.updateProfile(address, cid);
      }

      // Notify followers of profile update
      await this.pushService.sendNotification({
        recipient: address,
        title: 'Profile Updated',
        body: 'Your profile has been successfully updated',
        payload: {
          type: 'profile_update',
          cid
        }
      });

      return cid;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getProfile(address: string): Promise<UserProfile> {
    try {
      // Get profile CID from contract
      const profileCID = await this.buddyContract.getProfileCID(address);
      
      // Get profile data from Filecoin
      const profileData = await this.filecoinService.retrieveJSON(profileCID);
      
      // Get ENS name
      const ensName = await this.ensService.getENSName(address);
      
      // Get buddy status and verification
      const buddyData = await this.buddyContract.buddies(address);

      return {
        address,
        ensName,
        ...profileData,
        isBuddy: buddyData.isVerified,
        buddyVerificationTime: buddyData.verificationTime.toNumber(),
        totalPosts: await this.getTotalPosts(address),
        totalLikes: await this.getTotalLikes(address),
        totalConnections: buddyData.totalConnections.toNumber(),
        rating: buddyData.rating.toNumber(),
        specialties: buddyData.specialties
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}
