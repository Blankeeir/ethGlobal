import type { WalletSchema } from '@dynamic-labs/wallet-book';
export type DeepLinkVariant = 'native' | 'universal';
type GetDeepLinkArgs = {
    metadata: WalletSchema;
    mode: 'connection' | 'regular';
    uri?: string;
    preference: DeepLinkVariant;
};
export declare const getDeepLink: ({ mode, uri, metadata, preference, }: GetDeepLinkArgs) => string;
export {};
