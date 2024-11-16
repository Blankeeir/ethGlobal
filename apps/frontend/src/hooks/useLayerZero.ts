// apps/frontend/src/hooks/useLayerZero.ts
import { useState, useCallback } from 'react';
import { ethers, constants } from 'ethers';
import { utils } from 'ethers/lib/utils';
import { useToast } from './useToast';
import { useWeb3 } from './useWeb3';

interface LayerZeroConfig {
  srcChainId: number;
  dstChainId: number;
  endpoint: string;
}

interface AdapterParams {
  version: number;
  gasLimit: string;
  nativeForDst: string;
  dstNativeAddr: string;
}

export const useLayerZero = (config?: Partial<LayerZeroConfig>) => {
  const [loading, setLoading] = useState(false);
  const { signer, address } = useWeb3();
  const toast = useToast();

  // Default adapter parameters
  const defaultAdapterParams: AdapterParams = useMemo(() => ({
    version: 1,
    gasLimit: '200000',
    nativeForDst: '0',
    dstNativeAddr: constants.AddressZero
  }), []);

  const estimateFees = useCallback(async (
    dstChainId: number,
    payload: string,
    adapterParams = defaultAdapterParams
  ) => {
    if (!signer || !config?.endpoint) return null;

    try {
      const endpoint = new ethers.Contract(
        config.endpoint,
        ['function estimateFees(uint16,address,bytes,bool,bytes) view returns (uint256,uint256)'],
        signer
      );

      const encodedAdapterParams = utils.solidityPack(
        ['uint16', 'uint256', 'uint256', 'address'],
        [
          adapterParams.version,
          adapterParams.gasLimit,
          adapterParams.nativeForDst,
          adapterParams.dstNativeAddr
        ]
      );

      const [nativeFee, zroFee] = await endpoint.estimateFees(
        dstChainId,
        address,
        payload,
        false,
        encodedAdapterParams
      );

      return { nativeFee, zroFee };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error estimating fees:', error);
      } else {
        console.error('Unexpected error:', error);
      }
      return null;
    }
  }, [signer, config, address, defaultAdapterParams]);

  const sendMessage = useCallback(async (
    dstChainId: number,
    payload: string,
    options?: {
      adapterParams?: Partial<AdapterParams>;
      zroPaymentAddress?: string;
    }
  ) => {
    if (!signer || !config?.endpoint) {
      throw new Error('LayerZero not configured');
    }

    setLoading(true);
    try {
      const endpoint = new ethers.Contract(
        config.endpoint,
        ['function send(uint16,bytes,bytes,address,address,bytes) payable'],
        signer
      );

      const adapterParams = {
        ...defaultAdapterParams,
        ...options?.adapterParams
      };

      const encodedAdapterParams = ethers.utils.solidityPack(
        ['uint16', 'uint256', 'uint256', 'address'],
        [
          adapterParams.version,
          adapterParams.gasLimit,
          adapterParams.nativeForDst,
          adapterParams.dstNativeAddr
        ]
      );

      // Estimate fees first
      const fees = await estimateFees(dstChainId, payload, adapterParams);
      if (!fees) throw new Error('Failed to estimate fees');

      const tx = await endpoint.send(
        dstChainId,
        ethers.utils.defaultAbiCoder.encode(['address'], [address]),
        payload,
        address,
        options?.zroPaymentAddress || ethers.constants.AddressZero,
        encodedAdapterParams,
        { value: fees.nativeFee }
      );

      const receipt = await tx.wait();
      toast.success('Cross-chain message sent successfully');
      return receipt;
    } catch (error: any) {
      toast.error('Failed to send cross-chain message', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, config, estimateFees, toast, address]);

  return {
    sendMessage,
    estimateFees,
    loading
  };
};
