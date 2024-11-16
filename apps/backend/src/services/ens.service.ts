// apps/frontend/src/services/ENSService.ts
import { ENS } from '@ensdomains/ensjs/dist/cjs/index.js';
import { Provider } from 'ethers';

export class ENSService {
  private ens: any;
  private provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
    this.ens = new ENS({ provider });
  }

  async registerBuddyENS(name: string, owner: string, duration: number) {
    try {
      const registrar = await this.ens.getRegistrar(name);
      const price = await registrar.getRent(name, duration);
      const tx = await registrar.register(name, owner, duration, {
        value: price,
        resolver: await this.ens.getResolver('resolver.eth'),
      });
      return await tx.wait();
    } catch (error) {
      console.error('ENS registration error:', error);
      throw error;
    }
  }

  async setReverseName(_address: string, name: string) {
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
