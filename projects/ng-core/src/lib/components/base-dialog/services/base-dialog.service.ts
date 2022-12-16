import { ComponentType } from '@angular/cdk/overlay';
import { Inject, Injectable, Optional } from '@angular/core';
import {
    MatLegacyDialog as MatDialog,
    MatLegacyDialogConfig as MatDialogConfig,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';

import { DEFAULT_DIALOG_CONFIG, DIALOG_CONFIG, DialogConfig } from '../tokens';
import { BaseDialogResponse } from '../types/base-dialog-response';
import { BaseDialogSuperclass } from '../utils/base-dialog-superclass';

@Injectable({
    providedIn: 'root',
})
export class BaseDialogService {
    constructor(
        private dialog: MatDialog,
        @Optional()
        @Inject(DIALOG_CONFIG)
        private readonly dialogConfig: DialogConfig
    ) {
        if (!dialogConfig) this.dialogConfig = DEFAULT_DIALOG_CONFIG;
    }

    open<C, D, R, S>(
        dialogComponent: ComponentType<BaseDialogSuperclass<C, D, R, S>>,
        /**
         *  Workaround when both conditions for the 'data' argument must be true:
         *  - typing did not require passing when it is optional (for example: {param: number} | void)
         *  - typing required to pass when it is required (for example: {param: number})
         */
        ...[data, configOrConfigName]: D extends void
            ? []
            : [data: D, configOrConfigName?: Omit<MatDialogConfig<D>, 'data'> | keyof DialogConfig]
    ): MatDialogRef<C, BaseDialogResponse<R, S>> {
        let config: Partial<MatDialogConfig<D>>;
        if (!configOrConfigName) config = {};
        else if (typeof configOrConfigName === 'string')
            config = this.dialogConfig[configOrConfigName];
        else config = configOrConfigName;

        return this.dialog.open(dialogComponent as never, {
            data,
            ...(dialogComponent as typeof BaseDialogSuperclass).defaultDialogConfig,
            ...config,
        });
    }
}
