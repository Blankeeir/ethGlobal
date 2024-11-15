import { WalletConnector, IPasskeyWalletConnector } from '../../lib';
export declare const isPasskeyWalletConnector: (walletConnector: WalletConnector | IPasskeyWalletConnector) => walletConnector is IPasskeyWalletConnector;
