import React, { createContext, useContext, useEffect, useState } from 'react';
import * as PushAPI from '@pushprotocol/restapi';
import { useWeb3 } from './Web3Context';
import { IFeeds } from '@pushprotocol/restapi';
import { Env as EnvType } from '@pushprotocol/restapi';
import { Signer, TypedDataDomain } from 'ethers';
import { TypedDataType } from 'abitype';
import { signTypedData } from 'viem/accounts';
// Assuming 'signer' is your Signer instance
const typedDataSigner = signer as Signer & TypedDataSigner;

interface PushUser {
  account: string;
  name?: string;
  about?: string;
  profilePicture?: string;
}

interface PushContextType {
  pushUser: PushUser | null;
  notifications: IFeeds[];
  messages: IFeeds[];
  sendMessage: (receiverAddress: string, message: string) => Promise<void>;
  getNotifications: () => Promise<void>;
  getChats: () => Promise<void>;
  createUser: (name: string, about?: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const PushContext = createContext<PushContextType | undefined>(undefined);

export const PushProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { context: { signer } } = useWeb3();
  const [pushUser, setPushUser] = useState<PushUser | null>(null);
  const [notifications, setNotifications] = useState<IFeeds[]>([]);
  const [messages, setMessages] = useState<IFeeds[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getNotifications = async () => {
    if (!pushUser) return;
    setIsLoading(true);
    try {
      const feeds = await PushAPI.user.getFeeds({
        user: pushUser.account,
        spam: false
      });
      setNotifications(feeds);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChats = async () => {
    if (!signer) return;
    setIsLoading(true);
    try {
      const user = await PushAPI.user.get({
        account: pushUser?.account || '',
        env: 'staging' as EnvType,
      });
      const chats = await PushAPI.chat.chats({
        account: pushUser?.account || '',
        toDecrypt: true,
        pgpPrivateKey: user.encryptedPrivateKey
      });
      setMessages(chats);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async () => {
    if (!signer) return;
    const typedDataSigner = signer as Signer & TypedDataType;
    setIsLoading(true);
    try {
      const address = await signer.getAddress();
      const user = await PushAPI.user.create({
        env: 'staging' as EnvType,
        signer: {
          getAddress: () => Promise.resolve(address),
          signMessage: (message: string | Uint8Array) => signer.signMessage(message),
          // signTypedData: (domain: any, types: any, message: any) => typedDataSigner.signTypedData(domain, types, message),
        }
      });
      setPushUser(user as unknown as PushUser);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessage = async (receiverAddress: string, message: string) => {
    if (!signer || !pushUser) return;
    setIsLoading(true);
    try {
      const address = await signer.getAddress();
      await PushAPI.chat.send({
        messageContent: message,
        messageType: 'Text',
        receiverAddress,
        signer: {
          getAddress: () => Promise.resolve(address),
          signMessage: (message: string | Uint8Array) => signer.signMessage(message),
          signTypedData: (domain: any, types: any, message: any) => signer._signTypedData(domain, types, message),
        }
      });
      await getChats();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initPush = async () => {
      if (signer) {
        try {
          const address = await signer.getAddress();
          const user = await PushAPI.user.get({ account: address });
          setPushUser(user as unknown as PushUser);
          await getNotifications();
          await getChats();
        } catch (error) {
          console.error('Failed to initialize Push Protocol:', error);
          setError(error as Error);
        }
      }
    };
    initPush();
  }, [signer]);

  return (
    <PushContext.Provider value={{
      pushUser,
      notifications,
      messages,
      sendMessage,
      getNotifications,
      getChats,
      createUser,
      isLoading,
      error
    }}>
      {children}
    </PushContext.Provider>
  );
};

export const usePush = () => {
  const context = useContext(PushContext);
  if (context === undefined) {
    throw new Error('usePush must be used within a PushProvider');
  }
  return context;
};
