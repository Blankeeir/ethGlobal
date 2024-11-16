// services/ProductService.ts
// import { useContract } from '../hooks/useContract';
import ContractInterface from "web3-eth-contract";
// import { SERVARE_NFT_ADDRESS } from '../const';
import { uploadToIPFS } from '../util/ipfs';
import { Product, ProductFilters } from '../util/types';
import { ProductFormData } from '../schemas/validation';
import { useContract } from '../hooks';
// import { callContract } from '../hooks';
import { SERVARE_NFT_ADDRESS } from '../const';
import surfoodNFTAbi from '../abi/SurfoodNFT.json';
// import { AbiItem } from 'viem';
import { AbiItem } from 'web3-utils';

class ProductService {
  private static instance: ProductService;
  private contract: ContractInterface | null | undefined;

constructor() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
//     this.contract = useContract('ServareNFT', SERVARE_NFT_ADDRESS, surfoodNFTAbi.abi as AbiItem[]);
}

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const { offset = 0, limit = 10, ...restFilters } = filters || {};

      const result = await this.contract.methods.getProducts(
        offset,
        limit,
        restFilters
      ).call();

      return this.formatProducts(result);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw this.handleError(error);
    }
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Upload image to IPFS
      if (!data.imageUri) {
        throw new Error('Image URI is required');
      }
      const imageHash = await uploadToIPFS(data.imageUri);
      if (!imageHash) throw new Error('Failed to upload image');

      // Create and upload metadata
      const metadata = {
        name: data.name,
        description: data.description,
        image: `ipfs://${imageHash}`,
        attributes: {
          quantity: data.quantity,
          location: data.location,
          category: data.category,
          carbonFootprint: data.carbonFootprint
        }
      };

      const metadataHash = await uploadToIPFS(JSON.stringify(metadata));
      if (!metadataHash) throw new Error('Failed to upload metadata');

      // Create product on blockchain
      const transaction = this.contract.methods.createProduct(
        data.name,
        data.description,
        data.quantity,
        data.location,
        Math.floor(new Date(data.expiryDate).getTime() / 1000),
        data.productionDate,
        data.category,
        `ipfs://${imageHash}`,
        data.price,
        metadataHash,
        data.carbonFootprint
      );

      const receipt = await transaction.send();
      const productId = receipt.events?.ProductCreated?.returnValues?.tokenId;

      return this.getProduct(productId);
    } catch (error) {
      console.error('Error creating product:', error);
      throw this.handleError(error);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const product = await this.contract.methods.getProduct(id).call();
      return this.formatProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      await this.contract.methods.toggleProductListing(id, false, 0).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw this.handleError(error);
    }
  }

  private formatProduct(data: {
    tokenId?: string;
    id?: string;
    name: string;
    description: string;
    quantity: string;
    location: string;
    expiryDate: string;
    productionDate: string;
    category: string;
    imageURI: string;
    price: string;
    isListed: boolean;
    producer: string;
    isVerified: boolean;
    ipfsMetadataHash: string;
    quality: string;
    carbonFootprint: string;
  }): Product {
    return {
      id: data.tokenId?.toString() || data.id || '',
      name: data.name,
      description: data.description,
      quantity: Number(data.quantity),
      location: data.location,
      expiryDate: Number(data.expiryDate) * 1000,
      productionDate: data.productionDate,
      category: data.category,
      imageUri: data.imageURI,
      price: Number(data.price),
      isListed: Boolean(data.isListed),
      producer: data.producer,
      isVerified: Boolean(data.isVerified),
      ipfsMetadataHash: data.ipfsMetadataHash,
      quality: data.quality,
      carbonFootprint: Number(data.carbonFootprint),
      createdAt: new Date().toISOString(), // Assuming current date as createdAt
      listingType: 'default', // Assuming a default value for listingType
      imageUrl: data.imageURI, // Assuming imageUri is the same as imageUrl
      qualityScore: 0 // Assuming a default value for qualityScore
    };
  }

  private formatProducts(data: unknown[]): Product[] {
    return data.map(item => this.formatProduct(item as {
      tokenId?: string;
      id?: string;
      name: string;
      description: string;
      quantity: string;
      location: string;
      expiryDate: string;
      productionDate: string;
      category: string;
      imageURI: string;
      price: string;
      isListed: boolean;
      producer: string;
      isVerified: boolean;
      ipfsMetadataHash: string;
      quality: string;
      carbonFootprint: string;
    }));
  }

  private handleError(error: unknown): Error {
    const message = (error as Error)?.message || 'An unknown error occurred';
    return new Error(`Product service error: ${message}`);
  }
}

export const productService = ProductService.getInstance();