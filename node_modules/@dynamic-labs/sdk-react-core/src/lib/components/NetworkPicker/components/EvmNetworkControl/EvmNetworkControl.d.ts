import { Dispatch, SetStateAction } from 'react';
import { WalletConnector } from '@dynamic-labs/wallet-connector-core';
import { EvmNetwork } from '@dynamic-labs/types';
type Props = {
    activeClassName?: string;
    className?: string;
    evmNetworks?: EvmNetwork[];
    isOpen: boolean;
    loading: boolean;
    network: number | string | undefined;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    showNetworkName?: boolean;
    walletConnector: WalletConnector | undefined;
};
export declare const EvmNetworkControl: ({ evmNetworks, className, activeClassName, network, walletConnector, isOpen, setIsOpen, showNetworkName, }: Props) => JSX.Element;
export {};
