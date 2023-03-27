import { Directive, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DEFAULT_DIALOG_CONFIG } from '../tokens';
import { BaseDialogResponse } from '../types/base-dialog-response';
import { BaseDialogResponseStatus } from '../types/base-dialog-response-status';

@Directive()
export class BaseDialogSuperclass<
    DialogComponent,
    DialogData = void,
    DialogResponseData = void,
    DialogResponseStatus = void,
    DialogResponse = BaseDialogResponse<DialogResponseData, DialogResponseStatus>
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.medium;

    dialogData: DialogData = this.injector.get(MAT_DIALOG_DATA) as DialogData;
    dialogRef = this.injector.get(MatDialogRef) as MatDialogRef<DialogComponent, DialogResponse>;

    constructor(private injector: Injector) {}

    closeWithCancellation(data?: DialogResponseData) {
        this.dialogRef.close({
            status: BaseDialogResponseStatus.Cancelled,
            data,
        } as never);
    }

    closeWithSuccess(data?: DialogResponseData) {
        this.dialogRef.close({
            status: BaseDialogResponseStatus.Success,
            data,
        } as never);
    }

    closeWithError(data?: DialogResponseData) {
        this.dialogRef.close({
            status: BaseDialogResponseStatus.Error,
            data,
        } as never);
    }
}
