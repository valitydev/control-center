import { ComponentType } from '@angular/cdk/overlay';
import { Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { DIALOG_CONFIG, DialogConfig } from '../tokens';
import { BaseDialogResponse } from '../types/base-dialog-response';
import { BaseDialogSuperclass } from '../utils/base-dialog-superclass';

@Injectable({
    providedIn: 'root',
})
export class BaseDialogService {
    constructor(
        private dialog: MatDialog,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig
    ) {}

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
        return this.dialog.open(dialogComponent as never, {
            data,
            ...(dialogComponent as typeof BaseDialogSuperclass).defaultDialogConfig,
            ...(typeof configOrConfigName === 'string'
                ? this.dialogConfig[configOrConfigName]
                : configOrConfigName),
        });
    }
}
