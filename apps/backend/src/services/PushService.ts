// services/PushService.ts
import * as PushAPI from '@pushprotocol/restapi';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';
import { ethers } from 'ethers';

// src/services/PushNotificationService.ts
export class PushNotificationService {
  private pushAPI: typeof PushAPI;

  constructor() {
    this.pushAPI = pushClient;
  }

  async sendNotification({ recipient, title, body, payload = {} }: { recipient: string; title: string; body: string; payload?: any }) {
    try {
      await this.pushAPI.payloads.sendNotification({
        signer: getProvider().getSigner(),
        type: 1,
        identityType: 2,
        notification: { title, body },
        payload: { title, body, ...payload },
        recipients: `eip155:${recipient}`,
        channel: process.env.PUSH_CHANNEL_ADDRESS!
      });
    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    }
  }
}
