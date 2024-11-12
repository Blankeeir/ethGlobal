import { ADMIN_PRIVATE_KEY, NETWORK_URL } from '../config';
import { HttpClient, ThorClient, VeChainPrivateKeySigner, VeChainProvider } from '@vechain/sdk-network';
import { ServareABI } from '@utils/const';
import { SERVARE_SOL_ABI, config } from '@repo/config-contract';

export const thor = new ThorClient(new HttpClient(NETWORK_URL), {
  isPollingEnabled: false,
});

export const servareContract = thor.contracts.load(
  config.CONTRACT_ADDRESS,
  SERVARE_SOL_ABI,
  new VeChainPrivateKeySigner(Buffer.from(ADMIN_PRIVATE_KEY), new VeChainProvider(thor)),
);
