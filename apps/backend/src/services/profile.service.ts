// import { useApi } from './api-client';
import type { ProfileFormData } from '../schemas/validation';

class ProfileService {
  private static instance: ProfileService;
  // private api = useApi();

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getProfile() {
    // return this.api.user.getProfile();
  }

  async updateProfile(data: Partial<ProfileFormData>) {
    // Use the data parameter to avoid the compile error
    console.log(data);
    // return this.api.user.updateProfile(data);
  }

  async getTransactions() {
    // return this.api.transactions.list();
  }

  async getActivities() {
    // return this.api.user.getActivities?.() ?? [];
  }
}

export const profileService = ProfileService.getInstance();