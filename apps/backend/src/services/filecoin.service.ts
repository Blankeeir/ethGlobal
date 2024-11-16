// services/FilecoinService.ts
import { Web3Storage, Web3Response } from 'web3.storage';

declare global {
  interface Window {
    Blob: typeof Blob;
    File: typeof File;
  }
}

interface StorageResponse {
  cid: string;
  success: boolean;
}

export class FilecoinService {
  private client: Web3Storage;

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error('API token is required');
    }
    this.client = new Web3Storage({ token: apiToken });
  }

  async storeJSON(data: any): Promise<StorageResponse> {
    try {
      if (!data) {
        throw new Error('Data is required');
      }

      const blob = new Blob([JSON.stringify(data)], { 
        type: 'application/json' 
      });
      const file = new File([blob], 'data.json');
      const cid = await this.client.put([file]);

      return {
        cid,
        success: true
      };
    } catch (error) {
      console.error('Error storing data to Filecoin:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to store data to Filecoin'
      );
    }
  }

  async retrieveJSON<T>(cid: string): Promise<T> {
    try {
      if (!cid) {
        throw new Error('CID is required');
      }

      const res = await this.client.get(cid);
      if (!res?.ok) {
        throw new Error(`Failed to retrieve data: ${res?.status}`);
      }

      const files = await res.files();
      if (!files?.length) {
        throw new Error('No files found');
      }

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const content = new TextDecoder().decode(arrayBuffer);
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Error retrieving data from Filecoin:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to retrieve data from Filecoin');
    }
  }

  async deleteJSON(cid: string): Promise<boolean> {
    try {
      if (!cid) {
        throw new Error('CID is required');
      }

      await this.client.delete(cid);
      return true;
    } catch (error) {
      console.error('Error deleting data from Filecoin:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to delete data from Filecoin'
      );
    }
  }
}