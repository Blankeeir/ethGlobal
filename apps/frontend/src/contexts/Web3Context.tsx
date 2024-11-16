// src/contexts/Web3Context.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { ethers, Contract, providers, Signer } from 'ethers';
import { useToast } from '@chakra-ui/react';

// Import ABI JSON files
import MentalHealthIdentityABI from '../contracts/MentalHealthIdentity.json';
import BuddyVerificationABI from '../contracts/BuddyVerification.json';
import MentalHealthEventsABI from '../contracts/MentalHealthEvents.json';
import CrossChainChatABI from '../contracts/CrossChainChat.json';
import PostNFTABI from '../contracts/PostNFT.json';

// Import LayerZero and Hyperlane SDKs
import { LZ_RELAYER, LZ_ADDRESS, ChainId} from '@layerzerolabs/lz-sdk';
import { HyperlaneCore, MultiProvider, ChainMetadata } from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';

// Define contract types
interface Contracts {
  identity: Contract | null;
  buddy: Contract | null;
  events: Contract | null;
  chat: Contract | null;
  postNFT: Contract | null;
}

interface Web3ContextType {
  provider: providers.Web3Provider | null;
  signer: Signer | null;
  address: string | null;
  chainId: number | null;
  contracts: Contracts;
  // layerZero: OApp | null; // Updated type
  hyperlane: HyperlaneCore | null; // Adjusted based on actual export
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  sendCrossChainMessage: (
    targetChainId: number,
    message: string
  ) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [contracts, setContracts] = useState<Contracts>({
    identity: null,
    buddy: null,
    events: null,
    chat: null,
    postNFT: null,
  });
  // const [layerZero, setLayerZero] = useState<OApp | null>(null); // Updated type
  const [hyperlane, setHyperlane] = useState<HyperlaneCore | null>(null); // Adjusted based on actual export
  const toast = useToast();

  /**
   * Initialize Smart Contracts
   */
  const initializeContracts = useCallback(
    (signer: Signer) => {
      try {
        const identity = new Contract(
          process.env.REACT_APP_IDENTITY_CONTRACT!,
          MentalHealthIdentityABI.abi,
          signer
        );

        const buddy = new Contract(
          process.env.REACT_APP_BUDDY_CONTRACT!,
          BuddyVerificationABI.abi,
          signer
        );

        const events = new Contract(
          process.env.REACT_APP_EVENTS_CONTRACT!,
          MentalHealthEventsABI.abi,
          signer
        );

        const chat = new Contract(
          process.env.REACT_APP_CHAT_CONTRACT!,
          CrossChainChatABI.abi,
          signer
        );

        const postNFT = new Contract(
          process.env.REACT_APP_POSTNFT_CONTRACT!,
          PostNFTABI.abi,
          signer
        );

        setContracts({ identity, buddy, events, chat, postNFT });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Contract initialization error:', error);
          toast({
            title: 'Contract Initialization Error',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      }
    },
    [toast]
  );

  /**
   * Initialize LayerZero and Hyperlane SDKs
   */
  const initializeSDKs = useCallback(
    async (signer: Signer, currentChainId: number) => {
      try {
        // LayerZero Initialization
        const layerZeroEndpointAddress = process.env[
          `REACT_APP_LAYERZERO_ENDPOINT_${currentChainId}`
        ];
        if (!layerZeroEndpointAddress) {
          throw new Error(
            `LayerZero Endpoint address not set for chain ID ${currentChainId}`
          );
        }

        // // Initialize OApp for LayerZero
        // const oApp = new OApp(layerZeroEndpointAddress, signer);
        // setLayerZero(oApp);

        // Hyperlane Initialization
        const hyperlaneConfig = process.env.REACT_APP_HYPERLANE_CONFIG;
        if (!hyperlaneConfig) {
          throw new Error(
            'Hyperlane configuration not set in environment variables'
          );
        }

        const chainMetadata: Record<string, ChainMetadata> = {
          [`chain${currentChainId}`]: {
            name: 'default',
            chainId: currentChainId,
            domainId: currentChainId,
            protocol: ProtocolType.Ethereum,
            rpcUrls: [{ http: 'http://localhost:8545' }],
          }
        };

        const multiProvider = new MultiProvider(chainMetadata);
        // multiProvider.setSharedSigner(Signer);

        const contractsMap = {
          [currentChainId]: JSON.parse(hyperlaneConfig),
        };

        const hyperlaneClient = new HyperlaneCore(
          contractsMap,
          multiProvider
        );
        setHyperlane(hyperlaneClient);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('SDK initialization error:', error);
          toast({
            title: 'SDK Initialization Error',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      }
    },
    [toast]
  );

  /**
   * Connect to Wallet and Initialize Contracts & SDKs
   */
  const connect = useCallback(async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new providers.Web3Provider(window.ethereum);
        await web3Provider.send('eth_requestAccounts', []); // Prompt user to connect wallet
        const web3Signer = await web3Provider.getSigner();
        const userAddress = await web3Signer.getAddress();
        const network = await web3Provider.getNetwork();
        const numericChainId = Number(network.chainId);

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAddress(userAddress);
        setChainId(numericChainId);

        initializeContracts(web3Signer);
        await initializeSDKs(web3Signer, numericChainId);

        toast({
          title: 'Connected',
          description: `Connected to ${network.name}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('No Ethereum wallet found. Please install MetaMask.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Connection Error:', error);
        toast({
          title: 'Connection Error',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Connection Error',
          description: 'An unknown error occurred.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    }
  }, [initializeContracts, initializeSDKs, toast]);

  /**
   * Disconnect from Wallet
   */
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setContracts({
      identity: null,
      buddy: null,
      events: null,
      chat: null,
      postNFT: null,
    });
    // setLayerZero(null);
    setHyperlane(null);
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Switch Network in Wallet
   */
  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(targetChainId) }],
        });
        toast({
          title: 'Network Switched',
          description: `Switched to chain ID ${targetChainId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4902) {
          toast({
            title: 'Network Unavailable',
            description: 'This network is not available in your wallet. Please add it.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        } else if (error instanceof Error) {
          console.error('Switch Network Error:', error);
          toast({
            title: 'Network Switch Error',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Network Switch Error',
            description: 'An unknown error occurred while switching networks.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      }
    },
    [toast]
  );

  /**
   * Send Cross-Chain Message via LayerZero
   */
  // const sendCrossChainMessage = useCallback(
  //   async (targetChainId: number, message: string) => {
  //     if (!layerZero || !address) {
  //       toast({
  //         title: 'Cross-Chain Message Error',
  //         description: 'LayerZero SDK not initialized or address missing.',
  //         status: 'error',
  //         duration: 9000,
  //         isClosable: true,
  //       });
  //       return;
  //     }

  //     try {
  //       // Encode the message as bytes
  //       const payload = ethers.toBeHex(message);

  //       // Estimate fees required for sending the message
  //       const fees = await layerZero.estimateFees(
  //         targetChainId,
  //         process.env.REACT_APP_TARGET_CONTRACT_ADDRESS!, // Target contract address on target chain
  //         payload,
  //         false, // Use app call
  //         '0x' // Adapter parameters (if any)
  //       );

  //       // Send the message
  //       const tx = await layerZero.send(
  //         targetChainId,
  //         process.env.REACT_APP_TARGET_CONTRACT_ADDRESS!, // Target contract address on target chain
  //         payload,
  //         address, // Refund address
  //         ethers.ZeroAddress, // ZRO payment address (if not using ZRO)
  //         '0x', // Adapter parameters (if any)
  //         { value: fees[0] } // Send the required fees
  //       );

  //       await tx.wait(); // Wait for transaction confirmation

  //       toast({
  //         title: 'Message Sent',
  //         description: 'Your cross-chain message has been sent successfully.',
  //         status: 'success',
  //         duration: 9000,
  //         isClosable: true,
  //       });
  //     } catch (error: unknown) {
  //       if (error instanceof Error) {
  //         console.error('sendCrossChainMessage Error:', error);
  //         toast({
  //           title: 'Cross-Chain Message Error',
  //           description: error.message,
  //           status: 'error',
  //           duration: 9000,
  //           isClosable: true,
  //         });
  //       } else {
  //         toast({
  //           title: 'Cross-Chain Message Error',
  //           description: 'An unknown error occurred while sending the message.',
  //           status: 'error',
  //           duration: 9000,
  //           isClosable: true,
  //         });
  //       }
  //     }
  //   },
  //   [layerZero, address, toast]
  // );

  /**
   * Effect to handle wallet events
   */
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', connect);
      window.ethereum.on('chainChanged', connect);
      window.ethereum.on('disconnect', disconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', connect);
        window.ethereum.removeListener('chainChanged', connect);
        window.ethereum.removeListener('disconnect', disconnect);
      };
    }
  }, [connect, disconnect]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        contracts,
        // layerZero,
        hyperlane,
        connect,
        disconnect,
        switchNetwork,
        sendCrossChainMessage: async () => {
          throw new Error('sendCrossChainMessage not implemented');
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return {context, eventContract: context.contracts.events,   address: context.address,  ChainId, chatContract: context.contracts.chat,   buddyContract: context.contracts.buddy,   identityContract: context.contracts.identity,   postNFTContract: context.contracts.postNFT,   hyperlane: context.hyperlane,   connect: context.connect,   disconnect: context.disconnect,   switchNetwork: context.switchNetwork,   sendCrossChainMessage: context.sendCrossChainMessage, };
};
