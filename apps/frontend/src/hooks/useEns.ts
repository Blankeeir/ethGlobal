import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { getAddress, type Address } from 'viem';
import { createConfig, getEnsText } from '@wagmi/core';
import { http} from 'wagmi';
import { mainnet } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

export const useENS = () => {
  const publicClient = usePublicClient();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const lookupAddress = async (address: string) => {
    if (!publicClient) return;
    try {
      const name = await publicClient.getEnsName({
        address: getAddress(address) as Address,
      });
      setEnsName(name);

      if (name) {
        const resolver = await publicClient.getEnsResolver({ name });

        if (resolver) {
          const avatar = await getEnsText(config, {
            name,
            key: 'avatar',
          });
          setEnsAvatar(avatar || null);
        }
      }
    } catch (err) {
      console.error('Error looking up ENS name:', err);
    }
  };

  const resolveENS = async (name: string) => {
    if (!publicClient) return;
    try {
      const resolvedAddress = await publicClient.getEnsAddress({ name });
      setAddress(resolvedAddress);

      if (resolvedAddress) {
        const resolver = await publicClient.getEnsResolver({ name });

        if (resolver) {
          const avatar = await getEnsText(config, {
            name,
            key: 'avatar',
          });
          setEnsAvatar(avatar || null);
        }
      }
    } catch (err) {
      console.error('Error resolving ENS name:', err);
    }
  };

  return {
    ensName,
    ensAvatar,
    address,
    lookupAddress,
    resolveENS,
  };
};
