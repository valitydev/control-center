import { ValuesType } from 'utility-types';

import { InjectionToken } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

export type DialogConfig = Record<'small' | 'medium' | 'large', MatDialogConfig<undefined>>;

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('dialogConfig');

export const BASE_CONFIG: ValuesType<DialogConfig> = {
    maxHeight: '100vh',
    disableClose: true,
    autoFocus: false,
    minWidth: '0',
    maxWidth: 'calc(100vw - 16px)',
    width: '552px',
};

export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
    small: {
        ...BASE_CONFIG,
        width: '360px',
    },
    medium: BASE_CONFIG,
    large: {
        ...BASE_CONFIG,
        width: '1000px',
    },
};

export const DEFAULT_DIALOG_CONFIG_FULL_HEIGHT = 'calc(90vh - 48px)';
