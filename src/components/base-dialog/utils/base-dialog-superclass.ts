import { Directive, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DEFAULT_DIALOG_CONFIG } from '@cc/app/tokens';

import { BaseDialogResponse } from '../types/base-dialog-response';

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
}
