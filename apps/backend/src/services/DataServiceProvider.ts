// services/DataServiceProvider.ts
export class DataServiceProvider {
    private static instance: DataServiceProvider;
    private services: Map<string, any>;
  
    private constructor() {
      this.services = new Map();
    }
  
    static getInstance(): DataServiceProvider {
      if (!DataServiceProvider.instance) {
        DataServiceProvider.instance = new DataServiceProvider();
      }
      return DataServiceProvider.instance;
    }
  
    registerService(name: string, service: any) {
      this.services.set(name, service);
    }
  
    getService(name: string) {
      return this.services.get(name);
    }
  
    static initializeServices(config: any) {
      const instance = DataServiceProvider.getInstance();
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  
      // Initialize core services
      const filecoinService = new FilecoinService();
      const pushService = new PushService(config.pushConfig);
      const ensService = new ENSService(provider);
  
      // Initialize contracts
      const buddyContract = new BuddySystemContract(
        config.contracts.buddySystem,
        provider
      );
      const postContract = new PostNFTContract(
        config.contracts.postNFT,
        provider
      );
  
      // Register services
      instance.registerService('user', new UserDataService(
        filecoinService,
        pushService,
        ensService,
        buddyContract,
        postContract,
        provider
      ));
  
      return instance;
    }
  }