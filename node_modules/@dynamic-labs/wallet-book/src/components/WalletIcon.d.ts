import React, { FC, ReactNode } from 'react';
type WalletIconProps = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    walletKey: string | undefined;
} & {
    children?: ReactNode | any;
};
export declare const WalletIcon: FC<WalletIconProps>;
export {};
