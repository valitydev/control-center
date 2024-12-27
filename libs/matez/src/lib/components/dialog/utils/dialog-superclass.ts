import { Directive, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DEFAULT_DIALOG_CONFIG } from '../tokens';
import { DialogResponse } from '../types/dialog-response';
import { DialogResponseStatus } from '../types/dialog-response-status';

@Directive()
export class DialogSuperclass<
    TDialogComponent,
    TDialogData = void,
    TDialogResponseData = void,
    TDialogResponseStatus = void,
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.medium;

    dialogData = inject<TDialogData>(MAT_DIALOG_DATA);
    dialogRef =
        inject<
            MatDialogRef<
                TDialogComponent,
                DialogResponse<TDialogResponseData, TDialogResponseStatus>
            >
        >(MatDialogRef);

    closeWithCancellation(data?: TDialogResponseData) {
        this.dialogRef.close({
            status: DialogResponseStatus.Cancelled,
            data,
        } as never);
    }

    closeWithSuccess(data?: TDialogResponseData) {
        this.dialogRef.close({
            status: DialogResponseStatus.Success,
            data,
        } as never);
    }

    closeWithError(data?: TDialogResponseData) {
        this.dialogRef.close({
            status: DialogResponseStatus.Error,
            data,
        } as never);
    }
}
