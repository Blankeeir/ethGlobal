"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VeChainService", {
    enumerable: true,
    get: function() {
        return VeChainService;
    }
});
const _connexframework = require("@vechain/connex-framework");
const _connexdriver = require("@vechain/connex-driver");
const _ServareMarketplacejson = _interop_require_default(require("../../../contracts/abi/ServareMarketplace.json"));
const _SupplyChainTrackingjson = _interop_require_default(require("../../../contracts/abi/SupplyChainTracking.json"));
const _SurfoodNFTjson = _interop_require_default(require("../../../contracts/abi/SurfoodNFT.json"));
const _config = require("../config");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let VeChainService = class VeChainService {
    static getInstance() {
        if (!VeChainService.instance) {
            VeChainService.instance = new VeChainService();
        }
        return VeChainService.instance;
    }
    async createProduct(productData, caller) {
        const method = this.contracts.nft.method('createProduct');
        const clause = method.asClause(productData.name, productData.description, productData.quantity, productData.location, productData.expiryDate, productData.productionDate, productData.category, productData.imageUri, productData.price, productData.metadataHash, productData.carbonFootprint);
        const txResponse = await this.connex.vendor.sign('tx', [
            clause
        ]).signer(caller).request();
        return this.waitForTxReceipt(txResponse.txid);
    }
    async listProduct(tokenId, price, listingType, auctionDuration, caller) {
        const method = this.contracts.marketplace.method('listItem');
        const clause = method.asClause(tokenId, price, listingType, auctionDuration);
        const txResponse = await this.connex.vendor.sign('tx', [
            clause
        ]).signer(caller).request();
        return this.waitForTxReceipt(txResponse.txid);
    }
    async buyProduct(tokenId, caller) {
        const method = this.contracts.marketplace.method('buyItem');
        const clause = method.asClause(tokenId);
        const txResponse = await this.connex.vendor.sign('tx', [
            clause
        ]).signer(caller).request();
        return this.waitForTxReceipt(txResponse.txid);
    }
    async addSupplyChainEvent(tokenId, eventData, caller) {
        const method = this.contracts.nft.method('addSupplyChainEvent');
        const clause = method.asClause(tokenId, eventData.eventType, eventData.location, eventData.temperature, eventData.humidity, eventData.additionalDataHash);
        const txResponse = await this.connex.vendor.sign('tx', [
            clause
        ]).signer(caller).request();
        return this.waitForTxReceipt(txResponse.txid);
    }
    async verifyProduct(tokenId, verificationData, caller) {
        const method = this.contracts.nft.method('verifyProduct');
        const clause = method.asClause(tokenId, verificationData.verificationType, verificationData.isVerified, verificationData.notes);
        const txResponse = await this.connex.vendor.sign('tx', [
            clause
        ]).signer(caller).request();
        return this.waitForTxReceipt(txResponse.txid);
    }
    async getProduct(tokenId) {
        const method = this.contracts.nft.method('getProduct');
        const result = await method.call(tokenId);
        return this.formatProductData(result);
    }
    async getSupplyChainEvents(tokenId) {
        const method = this.contracts.nft.method('getSupplyChainEvents');
        const result = await method.call(tokenId);
        return this.formatSupplyChainEvents(result);
    }
    async getVerifications(tokenId) {
        const method = this.contracts.nft.method('getVerifications');
        const result = await method.call(tokenId);
        return this.formatVerifications(result);
    }
    async getListing(tokenId) {
        const method = this.contracts.marketplace.method('listings');
        const result = await method.call(tokenId);
        return this.formatListing(result);
    }
    async waitForTxReceipt(txId) {
        let receipt = null;
        while(!receipt){
            receipt = await this.connex.thor.transaction(txId).getReceipt();
            if (!receipt) {
                await new Promise((resolve)=>setTimeout(resolve, 3000));
            }
        }
        return receipt;
    }
    formatProductData(data) {
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
            qualityScore: data.qualityScore.toString()
        };
    }
    formatSupplyChainEvents(events) {
        return events.map((event)=>({
                timestamp: new Date(event.timestamp * 1000),
                eventType: event.eventType,
                location: event.location,
                handler: event.handler,
                temperature: event.temperature,
                humidity: event.humidity,
                additionalDataHash: event.additionalDataHash
            }));
    }
    formatVerifications(verifications) {
        return verifications.map((verification)=>({
                timestamp: new Date(verification.timestamp * 1000),
                verifier: verification.verifier,
                verificationType: verification.verificationType,
                isVerified: verification.isVerified,
                notes: verification.notes
            }));
    }
    formatListing(listing) {
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
            highestBid: listing.highestBid > 0 ? utils.formatEther(listing.highestBid) : '0'
        };
    }
    subscribeToEvents(eventName, callback) {
        const eventFilter = this.connex.thor.filter('event', [
            this.getEventCriteria(eventName)
        ]);
        return eventFilter.apply(0, Number.MAX_SAFE_INTEGER).then((events)=>{
            events.forEach((event)=>{
                callback(this.formatEvent(eventName, event));
            });
        });
    }
    getEventCriteria(eventName) {
        switch(eventName){
            case 'ProductCreated':
                return {
                    address: _config.config.contracts.nft
                };
            case 'Listed':
            case 'Sale':
                return {
                    address: _config.config.contracts.marketplace
                };
            default:
                throw new Error(`Unknown event: ${eventName}`);
        }
    }
    formatEvent(eventName, event) {
        const { utils } = require('ethers');
        switch(eventName){
            case 'ProductCreated':
                return {
                    tokenId: event.topics[1],
                    producer: event.topics[2],
                    name: event.data.name,
                    price: utils.formatEther(event.data.price)
                };
            case 'Listed':
                return {
                    tokenId: event.topics[1],
                    seller: event.topics[2],
                    price: utils.formatEther(event.data.price),
                    listingType: event.data.listingType
                };
            case 'Sale':
                return {
                    tokenId: event.topics[1],
                    seller: event.topics[2],
                    buyer: event.topics[3],
                    price: utils.formatEther(event.data.price)
                };
            default:
                return event;
        }
    }
    constructor(){
        _define_property(this, "connex", void 0);
        _define_property(this, "contracts", void 0);
        const driver = new _connexdriver.Driver(new _connexdriver.SimpleNet(_config.config.vechain.nodeUrl), this.connex.thor.genesis);
        this.connex = new _connexframework.Framework(driver);
        this.contracts = {
            nft: this.connex.thor.account(_config.config.contracts.nft).method(_SurfoodNFTjson.default),
            marketplace: this.connex.thor.account(_config.config.contracts.marketplace).method(_ServareMarketplacejson.default),
            supplyChain: this.connex.thor.account(_config.config.contracts.supplyChain).method(_SupplyChainTrackingjson.default)
        };
    }
};
_define_property(VeChainService, "instance", void 0);

//# sourceMappingURL=vechain.service.js.map