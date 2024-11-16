// services/AuthService.ts
import { DynamicAuth } from '@dynamic-labs/sdk-react';
import { ethers } from 'ethers';
import { PushService } from './push.service';
import { ENSService } from './ens.service';

interface UserProfile {
  address: string;
  ensName?: string;
  isBuddy: boolean;
  buddyVerificationTime?: number;
  totalPosts: number;
  totalLikes: number;
  totalConnections: number;
  bio?: string;
  avatar?: string;
}

export class AuthService {
  private pushService: PushService;
  private ensService: ENSService;
  constructor(pushService: PushService, ensService: ENSService) {
    this.pushService = pushService;
    this.ensService = ensService;
  }

  async signMessage(message: string, signer: ethers.Signer): Promise<string> {
    try {
      return await signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }

  async registerBuddy(address: string, ensName: string, signature: string) {
    // Call buddy verification contract
    // Store verification details
    // Send welcome notification
  }
}