// // utils/ipfs.ts
// import { create, IPFSHTTPClient } from 'ipfs-http-client';
// import { Buffer } from 'buffer';

// // Types for IPFS configuration and responses
// interface IPFSConfig {
//   url: string;
//   headers?: {
//     authorization?: string;
//   };
// }

// // interface IPFSUploadResponse {
// //   cid: string;
// //   size: number;
// //   path: string;
// // }

// class IPFSService {
//   private client: IPFSHTTPClient | null = null;
//   private static instance: IPFSService | null = null;

//   private constructor() {
//     this.initializeClient();
//   }

//   // Singleton pattern
//   public static getInstance(): IPFSService {
//     if (!IPFSService.instance) {
//       IPFSService.instance = new IPFSService();
//     }
//     return IPFSService.instance;
//   }

//   private initializeClient(): void {
//     try {
//       const config: IPFSConfig = {
//         url: process.env.VITE_IPFS_API_URL || 'https://ipfs.infura.io:5001/api/v0',
//       };

//       // Add authorization if credentials are provided
//       if (process.env.VITE_IPFS_PROJECT_ID && process.env.VITE_IPFS_PROJECT_SECRET) {
//         const auth = 'Basic ' + Buffer.from(
//           process.env.VITE_IPFS_PROJECT_ID + ':' + process.env.VITE_IPFS_PROJECT_SECRET
//         ).toString('base64');
        
//         config.headers = {
//           authorization: auth
//         };
//       }

//       this.client = create(config);
//     } catch (error) {
//       console.error('Failed to initialize IPFS client:', error);
//       this.client = null;
//     }
//   }

//   /**
//    * Uploads a file or string to IPFS
//    * @param content File or string to upload
//    * @returns Promise with IPFS hash
//    */
//   public async upload(content: File | string): Promise<string> {
//     if (!this.client) {
//       throw new Error('IPFS client not initialized');
//     }

//     try {
//       let buffer: Buffer;

//       if (content instanceof File) {
//         const arrayBuffer = await content.arrayBuffer();
//         buffer = Buffer.from(arrayBuffer);
//       } else {
//         buffer = Buffer.from(content);
//       }

//       const result = await this.client.add(buffer, {
//         progress: (prog) => console.log(`IPFS upload progress: ${prog}`),
//       });

//       return result.path;
//     } catch (error) {
//       console.error('IPFS upload failed:', error);
//       throw new Error(this.getErrorMessage(error));
//     }
//   }

//   /**
//    * Uploads metadata object to IPFS
//    * @param metadata Object to upload
//    * @returns Promise with IPFS hash
//    */
//   public async uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
//     try {
//       const jsonString = JSON.stringify(metadata);
//       return await this.upload(jsonString);
//     } catch (error) {
//       console.error('Failed to upload metadata:', error);
//       throw new Error('Failed to upload metadata to IPFS');
//     }
//   }

//   /**
//    * Uploads an image file to IPFS with validation
//    * @param file Image file to upload
//    * @param maxSize Maximum file size in bytes
//    * @returns Promise with IPFS hash
//    */
//   public async uploadImage(file: File, maxSize: number = 5000000): Promise<string> {
//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       throw new Error('File must be an image');
//     }

//     // Validate file size
//     if (file.size > maxSize) {
//       throw new Error(`File size must be less than ${maxSize / 1000000}MB`);
//     }

//     try {
//       return await this.upload(file);
//     } catch (error) {
//       console.error('Failed to upload image:', error);
//       throw new Error('Failed to upload image to IPFS');
//     }
//   }

//   /**
//    * Gets IPFS URL for a given hash
//    * @param hash IPFS hash
//    * @returns IPFS gateway URL
//    */
//   public getIPFSUrl(hash: string): string {
//     const gateway = process.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
//     return `${gateway}${hash}`;
//   }

//   /**
//    * Checks if a given IPFS hash exists and is accessible
//    * @param hash IPFS hash to check
//    * @returns Promise<boolean>
//    */
//   public async checkIPFSHash(hash: string): Promise<boolean> {
//     try {
//       const response = await fetch(this.getIPFSUrl(hash), { method: 'HEAD' });
//       return response.ok;
//     } catch (error) {
//       return false;
//     }
//   }

//   private getErrorMessage(error: unknown): string {
//     if (error instanceof Error) {
//       if (error.message.includes('rate limit')) {
//         return 'IPFS upload rate limit exceeded. Please try again later.';
//       }
//       if (error.message.includes('timeout')) {
//         return 'IPFS upload timed out. Please try again.';
//       }
//       return error.message;
//     }
//     return 'An unknown error occurred during IPFS upload';
//   }
// }

// // Export singleton instance
// const ipfsService = IPFSService.getInstance();

// // Export utility functions
// export const uploadToIPFS = async (content: File | string): Promise<string> => {
//   return await ipfsService.upload(content);
// };

// export const uploadMetadataToIPFS = async (metadata: Record<string, unknown>): Promise<string> => {
//   return await ipfsService.uploadMetadata(metadata);
// };

// export const uploadImageToIPFS = async (file: File, maxSize?: number): Promise<string> => {
//   return await ipfsService.uploadImage(file, maxSize);
// };

// export const getIPFSUrl = (hash: string): string => {
//   return ipfsService.getIPFSUrl(hash);
// };

// export const checkIPFSHash = async (hash: string): Promise<boolean> => {
//   return await ipfsService.checkIPFSHash(hash);
// };

// // Usage example:
// /*
// try {
//   // Upload a file
//   const imageHash = await uploadImageToIPFS(imageFile);
//   console.log('Image uploaded:', imageHash);

//   // Upload metadata
//   const metadata = {
//     name: 'Product Name',
//     description: 'Product Description',
//     image: `ipfs://${imageHash}`,
//     attributes: {
//       // ... product attributes
//     }
//   };
//   const metadataHash = await uploadMetadataToIPFS(metadata);
//   console.log('Metadata uploaded:', metadataHash);

//   // Get IPFS URL
//   const url = getIPFSUrl(imageHash);
//   console.log('IPFS URL:', url);
// } catch (error) {
//   console.error('Upload failed:', error);
// }
// */