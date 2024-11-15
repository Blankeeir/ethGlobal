import { FC, PropsWithChildren, ReactElement, ElementType } from 'react';
import { CopyKey } from '../../shared';
export type TooltipProps = {
    as?: ElementType;
    className?: string;
    content: string | ReactElement;
} & CopyKey;
export declare const Tooltip: FC<PropsWithChildren<TooltipProps>>;
