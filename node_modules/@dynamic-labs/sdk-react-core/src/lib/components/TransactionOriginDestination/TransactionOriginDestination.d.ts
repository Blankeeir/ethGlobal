import { FC } from 'react';
export type Props = {
    arrowIconClassName?: string;
    className?: string;
    destinationAddress: string;
    originAddress: string;
    textClassName?: string;
    walletIconClassName?: string;
    walletKey?: string;
};
export declare const TransactionOriginDestination: FC<Props>;
