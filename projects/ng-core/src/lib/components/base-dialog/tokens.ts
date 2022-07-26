import { InjectionToken } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { ValuesType } from 'utility-types';

export type DialogConfig = Record<'small' | 'medium' | 'large', MatDialogConfig<undefined>>;

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('dialogConfig');

export const BASE_CONFIG: ValuesType<DialogConfig> = {
    maxHeight: '90vh',
    disableClose: true,
    autoFocus: false,
    width: '552px',
};

export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
    small: { ...BASE_CONFIG, width: '360px' },
    medium: BASE_CONFIG,
    large: { ...BASE_CONFIG, width: '648px' },
};
