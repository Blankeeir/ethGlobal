// services/vechain.service.ts
import { Framework } from '@vechain/connex-framework';

import { Driver, SimpleNet } from '@vechain/connex-driver';
import ServareMarketplaceAbi from '../../../contracts/abi/ServareMarketplace.json';
import SupplyChainTrackingAbi from '../../../contracts/abi/SupplyChainTracking.json';
import ServareNFTAbi from '../../../contracts/abi/SurfoodNFT.json';
import { config } from '../config';

export class VeChainService {
  private static instance: VeChainService;
  private connex: Framework;
  private contracts: {
    nft: any;
    marketplace: any;
    supplyChain: any;
  };

  private constructor() {
    const driver = new Driver(new SimpleNet(config.vechain.nodeUrl), this.connex.thor.genesis);
    this.connex = new Framework(driver);
    this.contracts = {
      nft: this.connex.thor.account(config.contracts.nft).method(ServareNFTAbi),
      marketplace: this.connex.thor.account(config.contracts.marketplace).method(ServareMarketplaceAbi),
      supplyChain: this.connex.thor.account(config.contracts.supplyChain).method(SupplyChainTrackingAbi),
    };
  }

  static getInstance(): VeChainService {
    if (!VeChainService.instance) {
      VeChainService.instance = new VeChainService();
    }
    return VeChainService.instance;
  }

  async createProduct(productData: any, caller: string) {
    const method = this.contracts.nft.method('createProduct');
    const clause = method.asClause(
      productData.name,
      productData.description,
      productData.quantity,
      productData.location,
      productData.expiryDate,
      productData.productionDate,
      productData.category,
      productData.imageUri,
      productData.price,
      productData.metadataHash,
      productData.carbonFootprint,
    );

    const txResponse = await this.connex.vendor.sign('tx', [clause]).signer(caller).request();

    return this.waitForTxReceipt(txResponse.txid);
  }

  async listProduct(tokenId: string, price: string, listingType: number, auctionDuration: number, caller: string) {
    const method = this.contracts.marketplace.method('listItem');
    const clause = method.asClause(tokenId, price, listingType, auctionDuration);

    const txResponse = await this.connex.vendor.sign('tx', [clause]).signer(caller).request();

    return this.waitForTxReceipt(txResponse.txid);
  }

  async buyProduct(tokenId: string, caller: string) {
    const method = this.contracts.marketplace.method('buyItem');
    const clause = method.asClause(tokenId);

    const txResponse = await this.connex.vendor.sign('tx', [clause]).signer(caller).request();

    return this.waitForTxReceipt(txResponse.txid);
  }

  async addSupplyChainEvent(tokenId: string, eventData: any, caller: string) {
    const method = this.contracts.nft.method('addSupplyChainEvent');
    const clause = method.asClause(
      tokenId,
      eventData.eventType,
      eventData.location,
      eventData.temperature,
      eventData.humidity,
      eventData.additionalDataHash,
    );

    const txResponse = await this.connex.vendor.sign('tx', [clause]).signer(caller).request();

    return this.waitForTxReceipt(txResponse.txid);
  }

  async verifyProduct(tokenId: string, verificationData: any, caller: string) {
    const method = this.contracts.nft.method('verifyProduct');
    const clause = method.asClause(tokenId, verificationData.verificationType, verificationData.isVerified, verificationData.notes);

    const txResponse = await this.connex.vendor.sign('tx', [clause]).signer(caller).request();

    return this.waitForTxReceipt(txResponse.txid);
  }

  // Query methods
  async getProduct(tokenId: string) {
    const method = this.contracts.nft.method('getProduct');
    const result = await method.call(tokenId);
    return this.formatProductData(result);
  }

  async getSupplyChainEvents(tokenId: string) {
    const method = this.contracts.nft.method('getSupplyChainEvents');
    const result = await method.call(tokenId);
    return this.formatSupplyChainEvents(result);
  }

  async getVerifications(tokenId: string) {
    const method = this.contracts.nft.method('getVerifications');
    const result = await method.call(tokenId);
    return this.formatVerifications(result);
  }

  async getListing(tokenId: string) {
    const method = this.contracts.marketplace.method('listings');
    const result = await method.call(tokenId);
    return this.formatListing(result);
  }

  // Helper methods
  private async waitForTxReceipt(txId: string) {
    let receipt = null;
    while (!receipt) {
      receipt = await this.connex.thor.transaction(txId).getReceipt();
      if (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    return receipt;
  }

  private formatProductData(data: any) {
    const { utils } = require('ethers');

    return {
      name: data.name,
      description: data.description,
      quantity: data.quantity.toString(),
      location: data.location,
      expiryDate: new Date(data.expiryDate * 1000),
      productionDate: data.productionDate,
      category: data.category,
      imageUri: data.imageUri,
      price: utils.formatEther(data.price),
      isListed: data.isListed,
      producer: data.producer,
      isVerified: data.isVerified,
      carbonFootprint: data.carbonFootprint.toString(),
      qualityScore: data.qualityScore.toString(),
    };
  }

  private formatSupplyChainEvents(events: any) {
    return events.map((event: any) => ({
      timestamp: new Date(event.timestamp * 1000),
      eventType: event.eventType,
      location: event.location,
      handler: event.handler,
      temperature: event.temperature,
      humidity: event.humidity,
      additionalDataHash: event.additionalDataHash,
    }));
  }

  private formatVerifications(verifications: any) {
    return verifications.map((verification: any) => ({
      timestamp: new Date(verification.timestamp * 1000),
      verifier: verification.verifier,
      verificationType: verification.verificationType,
      isVerified: verification.isVerified,
      notes: verification.notes,
    }));
  }

  private formatListing(listing: any) {
    const { utils } = require('ethers');
    return {
      tokenId: listing.tokenId.toString(),
      seller: listing.seller,
      price: utils.formatEther(listing.price),
      isActive: listing.isActive,
      listedAt: new Date(listing.listedAt * 1000),
      listingType: listing.listingType,
      auctionEndTime: listing.auctionEndTime > 0 ? new Date(listing.auctionEndTime * 1000) : null,
      highestBidder: listing.highestBidder,
      highestBid: listing.highestBid > 0 ? utils.formatEther(listing.highestBid) : '0',
    };
  }

  // Event listeners
  subscribeToEvents(eventName: string, callback: (event: any) => void) {
    const eventFilter = this.connex.thor.filter('event', [this.getEventCriteria(eventName)]);

    return eventFilter.apply(0, Number.MAX_SAFE_INTEGER).then((events: any) => {
      events.forEach((event: any) => {
        callback(this.formatEvent(eventName, event));
      });
    });
  }

  private getEventCriteria(eventName: string) {
    // Define event criteria based on event name
    switch (eventName) {
      case 'ProductCreated':
        return { address: config.contracts.nft };
      case 'Listed':
      case 'Sale':
        return { address: config.contracts.marketplace };
      default:
        throw new Error(`Unknown event: ${eventName}`);
    }
  }

  private formatEvent(eventName: string, event: any) {
    const { utils } = require('ethers');
    // Format event data based on event type
    switch (eventName) {
      case 'ProductCreated':
        return {
          tokenId: event.topics[1],
          producer: event.topics[2],
          name: event.data.name,
          price: utils.formatEther(event.data.price),
        };
      case 'Listed':
        return {
          tokenId: event.topics[1],
          seller: event.topics[2],
          price: utils.formatEther(event.data.price),
          listingType: event.data.listingType,
        };
      case 'Sale':
        return {
          tokenId: event.topics[1],
          seller: event.topics[2],
          buyer: event.topics[3],
          price: utils.formatEther(event.data.price),
        };
      default:
        return event;
    }
  }
}
