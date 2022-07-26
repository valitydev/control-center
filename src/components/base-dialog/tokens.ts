import { InjectionToken } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

export type DialogConfig = {
    small: MatDialogConfig;
    medium: MatDialogConfig;
    large: MatDialogConfig;
};
export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('dialogConfig');
const BASE_CONFIG: MatDialogConfig = {
    maxHeight: '90vh',
    disableClose: true,
    autoFocus: false,
};
export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
    small: { ...BASE_CONFIG, width: '360px' },
    medium: { ...BASE_CONFIG, width: '552px' },
    large: { ...BASE_CONFIG, width: '648px' },
};
