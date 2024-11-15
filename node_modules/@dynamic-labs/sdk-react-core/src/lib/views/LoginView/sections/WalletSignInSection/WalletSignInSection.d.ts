/// <reference types="react" />
import { LoginWidgetProps } from '../LoginWidget';
interface WalletLoginProps extends LoginWidgetProps {
    numberOfItensToShow: number;
}
export declare const WalletSignInSection: React.FC<WalletLoginProps>;
export {};
