import { useEffect, useState } from 'react';
import { Connex } from '@vechain/connex';
import { useWallet } from '@vechain/dapp-kit-react';

export const useVeChain = () => {
  const [connex, setConnex] = useState<Connex | null>(null);
  const { account } = useWallet();

  useEffect(() => {
    const initConnex = async () => {
      const connexInstance = new Connex({
        node: 'https://testnet.vechain.org',
        network: 'test'
      });
      setConnex(connexInstance);
    };

    initConnex();
  }, []);

  const getBalance = async () => {
    if (!connex || !account) return null;
    const balance = await connex.thor
      .account(account)
      .get();
    return balance.balance;
  };

  const sendTransaction = async (txParams: Connex.Vendor.TxMessage) => {
    if (!connex || !account) throw new Error('Connex or account not initialized');

    try {
      const signedTx = await connex.vendor
        .sign('tx', txParams)
        .request();
      return signedTx;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return {
    account,
    connex,
    getBalance,
    sendTransaction
  };
};
