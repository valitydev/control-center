import { ComponentType } from '@angular/cdk/overlay';
import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { DEFAULT_DIALOG_CONFIG, DIALOG_CONFIG, DialogConfig } from '../tokens';
import { DialogResponse } from '../types/dialog-response';
import { DialogSuperclass } from '../utils/dialog-superclass';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    private dialog = inject(MatDialog);
    private readonly dialogConfig = inject<DialogConfig>(DIALOG_CONFIG, { optional: true });

    constructor() {
        if (!this.dialogConfig) {
            this.dialogConfig = DEFAULT_DIALOG_CONFIG;
        }
    }

    open<TDialogComponent, TDialogData, TDialogResponseData, TDialogResponseStatus>(
        dialogComponent: ComponentType<
            DialogSuperclass<
                TDialogComponent,
                TDialogData,
                TDialogResponseData,
                TDialogResponseStatus
            >
        >,
        /**
         *  Workaround when both conditions for the 'data' argument must be true:
         *  - typing did not require passing when it is optional (for example: {param: number} | void)
         *  - typing required to pass when it is required (for example: {param: number})
         */
        ...[data, configOrConfigName]: TDialogData extends void
            ? []
            : [
                  data: TDialogData,
                  configOrConfigName?:
                      | Omit<MatDialogConfig<TDialogData>, 'data'>
                      | keyof DialogConfig,
              ]
    ): MatDialogRef<TDialogComponent, DialogResponse<TDialogResponseData, TDialogResponseStatus>> {
        let config: Partial<MatDialogConfig<TDialogData>>;
        if (!configOrConfigName) {
            config = {};
        } else if (typeof configOrConfigName === 'string') {
            config = this.dialogConfig[configOrConfigName];
        } else {
            config = configOrConfigName;
        }

        return this.dialog.open(dialogComponent as never, {
            data,
            ...(dialogComponent as typeof DialogSuperclass).defaultDialogConfig,
            ...config,
        });
    }
}
