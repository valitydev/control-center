import { Directive, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DEFAULT_DIALOG_CONFIG } from '@cc/app/tokens';

import { BaseDialogResponse } from '../types/base-dialog-response';

@Directive()
export class BaseDialogSuperclass<
    DialogComponent,
    D = void,
    R = void,
    S = void,
    DialogResponse = BaseDialogResponse<R, S>
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.medium;

    dialogData: D = this.injector.get(MAT_DIALOG_DATA) as D;
    dialogRef = this.injector.get(MatDialogRef) as MatDialogRef<DialogComponent, DialogResponse>;

    constructor(private injector: Injector) {}

    close(result: DialogResponse): void {
        return this.dialogRef.close(result);
    }
}
