/// <reference types="react" />
type Props = {
    connected?: boolean;
    iconSize?: number;
    variant?: 'primary' | 'secondary';
    walletKey: string;
};
export declare const WalletIconWithStatus: ({ iconSize, walletKey, connected, variant, }: Props) => JSX.Element;
export {};
