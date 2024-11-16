// services/FilecoinService.ts
import { Web3Storage } from 'web3.storage';

export class FilecoinService {
  private client: Web3Storage;

  constructor(apiToken: string) {
    this.client = new Web3Storage({ token: apiToken });
  }

  async storeJSON(data: any) {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const file = new File([blob], 'data.json');
      const cid = await this.client.put([file]);
      return cid;
    } catch (error) {
      console.error('Error storing data on Filecoin:', error);
      throw error;
    }
  }

  async retrieveJSON(cid: string) {
    try {
      const res = await this.client.get(cid);
      if (!res?.ok) throw new Error('Failed to retrieve data');
      const files = await res.files();
      const file = files[0];
      const content = await file.text();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error retrieving data from Filecoin:', error);
      throw error;
    }
  }
}
