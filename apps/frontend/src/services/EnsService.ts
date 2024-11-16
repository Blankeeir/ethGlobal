// apps/frontend/src/services/ENSService.ts
import ENS, { getEnsAddress } from '@ensdomains/ensjs';
import { ethers } from 'ethers';

export class ENSService {
  private ens: ENS;
  private provider: ethers.providers.Provider;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.ens = setupENS(provider);
  }

  async registerBuddyENS(name: string, owner: string, duration: number) {
    try {
      const registrar = await this.ens.getRegistrar(name);
      const price = await registrar.getRent(name, duration);
      
      const tx = await registrar.register(name, owner, duration, {
        value: price,
        resolver: await this.ens.getResolver('resolver.eth')
      });
      
      return await tx.wait();
    } catch (error) {
      console.error('ENS registration error:', error);
      throw error;
    }
  }

  async setReverseName(address: string, name: string) {
    try {
      const reverseRegistrar = await this.ens.getReverseRegistrar();
      const tx = await reverseRegistrar.setName(name);
      return await tx.wait();
    } catch (error) {
      console.error('Reverse record setting error:', error);
      throw error;
    }
  }
}