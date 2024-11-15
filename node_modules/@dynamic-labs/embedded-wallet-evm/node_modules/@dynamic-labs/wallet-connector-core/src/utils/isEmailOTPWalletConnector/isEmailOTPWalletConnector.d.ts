import { IEmailOTPWalletConnector, WalletConnector } from '../../lib';
export declare const isEmailOTPWalletConnector: (walletConnector: WalletConnector | IEmailOTPWalletConnector) => walletConnector is IEmailOTPWalletConnector;
