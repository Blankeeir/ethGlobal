// apps/frontend/src/hooks/useWeb3.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { useToast } from './useToast';
import { PostNFTContract } from '../contracts';
import { LZ_ENDPOINTS, LZ_CHAIN_IDS } from '../config';

interface Web3State {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  address: string | null;
  chainId: number | null;
  postContract: PostNFTContract | null;
  lzEndpoint: ethers.Contract | null;
}

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    postContract: null,
    lzEndpoint: null,
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const initialize = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No MetaMask found');
      }
      const provider = new Web3Provider(window.ethereum);
      const provider = new providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const { chainId } = await provider.getNetwork();

      // Initialize Post NFT Contract
      const postContract = new ethers.Contract(
        process.env.REACT_APP_POST_NFT_ADDRESS!,
        PostNFTContract.abi,
        signer
      );

      // Initialize LayerZero Endpoint
      const lzEndpoint = new ethers.Contract(
        LZ_ENDPOINTS[chainId] || LZ_ENDPOINTS['polygon'],
        ['function send(uint16,bytes,bytes,address,address,bytes)'],
        signer
      );

      setState({
        provider,
        signer,
        address,
        chainId,
        postContract,
        lzEndpoint,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to connect to wallet', {
          description: error.message
        });
      } else {
        toast.error('Failed to connect to wallet');
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendCrossChainMessage = useCallback(async (
    targetChainId: number,
    message: string,
    // options = {}
  ) => {
    if (!state.lzEndpoint || !state.address) return;

    try {
      const fees = await state.lzEndpoint.estimateFees(
        targetChainId,
        state.address,
        message,
        false,
        '0x'
      );

      await state.lzEndpoint.send(
        targetChainId,
        state.address,
        message,
        state.address,
        constants.AddressZero,
        '0x',
          { value: fees[0] }
        );
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Cross-chain message failed', {
          description: error.message
        });
      } else {
        toast.error('Cross-chain message failed');
      }
      throw error;
    }
  }, [state.lzEndpoint, state.address, toast]);

  useEffect(() => {
    initialize();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', initialize);
      window.ethereum.on('chainChanged', initialize);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', initialize);
        window.ethereum.removeListener('chainChanged', initialize);
      }
    };
  }, [initialize]);

  return {
    ...state,
    loading,
    sendCrossChainMessage,
    initialize
  };
};
