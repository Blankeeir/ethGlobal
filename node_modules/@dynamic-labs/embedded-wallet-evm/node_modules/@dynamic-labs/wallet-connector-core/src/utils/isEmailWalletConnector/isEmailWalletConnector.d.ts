import { WalletConnector, IEmailWalletConnector } from '../../lib';
export declare const isEmailWalletConnector: (walletConnector: WalletConnector | IEmailWalletConnector) => walletConnector is IEmailWalletConnector;
