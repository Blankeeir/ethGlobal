// Now let's create a type file for the ABIs to get better TypeScript support:
// types/contracts.ts

export interface SupplyChainEvent {
    eventType: string;
    location: string;
    temperature: number;
    humidity: number;
    additionalDataHash: string;
    timestamp: number;
  }
  
export interface Verification {
    verificationType: string;
    isVerified: boolean;
    notes: string;
    timestamp: number;
  }

export interface Product {
    createdAt: string | number | Date;
    listingType: string;
    id: string;
    imageUrl: string;
    name: string;
    description: string;
    quantity: number;
    location: string;
    expiryDate: number;
    productionDate: string;
    category: string;
    imageUri: string;
    price: number;
    isListed: boolean;
    producer: string;
    isVerified: boolean;
    carbonFootprint: number;
    qualityScore: number;
    ipfsMetadataHash: string; // Added property
    quality: string; // Add this line
}
 
export type Filter = {
  priceRange: [number, number];
  qualityScore: [number, number];
  categories: string[];
  listingType: 'all' | 'fixed' | 'auction';
  carbonFootprint: [number, number];
  location: string;
  verificationStatus: 'all' | 'verified' | 'unverified';
  expiryDateRange: [string, string];
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'quality_high' | 'expiry_soon';
};
export interface TrackingData {
    tokenId: string;
    timestamp: number;
    location: string;
    handler: string;
    status: string;
    envKeys: string[];
    envValues: string[];
    temperature: number;
    humidity: number;
    isValidated: boolean;
    validator: string;
  }

  
  export interface Listing {
    seller: string;
    price: number;
    isActive: boolean;
    listedAt: number;
    listingType: number;
    auctionEndTime: number;
    highestBidder: string;
    highestBid: number;
  }
  
  export const enum ListingType {
    FixedPrice = 0,
    Auction = 1
  }

  export interface Transaction {
    id: string;
    hash: string;
    block: number;
    timestamp: number;
    from: string;
    to: string;
    value: string;
  }

  export interface ProfileData {
    username: string;
    email: string;
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  }

  export interface ProductFilters {
    category?: string;
    producer?: string;
    isListed?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }
  export interface User {
    address: string;

    primaryWallet?: {
      address: string;
      connector?: {
        name: string;
      };
    };
  }

  export interface StoredUserData {
    address: string;
    primaryWallet?: string;
    lastLogin?: number;
  }