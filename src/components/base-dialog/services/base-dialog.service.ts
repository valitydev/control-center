import { ComponentType } from '@angular/cdk/overlay';
import { Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { DIALOG_CONFIG, DialogConfig } from '@cc/app/tokens';
import { BaseDialogResponse, BaseDialogSuperclass } from '@cc/components/base-dialog';

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
        data: D = null,
        configOrConfigName: Omit<MatDialogConfig<D>, 'data'> | keyof DialogConfig = {}
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
