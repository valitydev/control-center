import { ThemePalette } from '../../../styles';
import { PossiblyAsync } from '../../../utils';

export interface Option<T = unknown> {
    value: T;
    label?: string;
    description?: string;
    type?: unknown;
    details?: PossiblyAsync<unknown>;
    color?: ThemePalette;
}
