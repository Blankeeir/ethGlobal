import { WalletBookSchema } from '../schemas';
export type WalletLinks = {
    android: string;
    brave: string;
    chrome: string;
    edge: string;
    firefox: string;
    ios: string;
};
export declare const getWalletLinks: (walletBook: WalletBookSchema, walletKey: string) => WalletLinks;
