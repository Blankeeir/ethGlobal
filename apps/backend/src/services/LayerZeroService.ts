// src/services/LayerZeroService.ts
import { Contract } from 'ethers';
import LayerZeroEndpointABI from '../abi/LayerZeroEndpoint.json';

export class LayerZeroService {
  private endpoint: Contract;

  constructor(provider: ethers.providers.Provider) {
    this.endpoint = new Contract(
      layerZeroConfig.endpoint,
      LayerZeroEndpointABI,
      provider
    );
  }

  async sendMessage(
    dstChainId: number,
    destination: string,
    payload: string,
    refundAddress: string,
    zroPaymentAddress: string,
    adapterParams: string
  ) {
    try {
      const estimatedFee = await this.endpoint.estimateFees(
        dstChainId,
        destination,
        payload,
        false,
        adapterParams
      );

      const tx = await this.endpoint.send(
        dstChainId,
        destination,
        payload,
        refundAddress,
        zroPaymentAddress,
        adapterParams,
        { value: estimatedFee }
      );

      return await tx.wait();
    } catch (error) {
      console.error('LayerZero send error:', error);
      throw error;
    }
  }
}
