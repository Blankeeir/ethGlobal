import { WalletConnectorBase } from './WalletConnector';
export interface IEmailWalletConnector extends WalletConnectorBase {
    clearEmail(): void;
    get email(): string | undefined | null;
    setEmail(email: IEmailWalletConnector['email']): void;
}
