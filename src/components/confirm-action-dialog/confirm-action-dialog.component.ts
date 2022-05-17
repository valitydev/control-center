import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseDialogResponseStatus, BaseDialogSuperclass } from '@cc/components/base-dialog';

@Component({
    selector: 'cc-confirm-action-dialog',
    templateUrl: 'confirm-action-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmActionDialogComponent extends BaseDialogSuperclass<
    ConfirmActionDialogComponent,
    { title?: string }
> {
    cancel() {
        this.dialogRef.close({ status: BaseDialogResponseStatus.Cancelled });
    }

    confirm() {
        this.dialogRef.close({ status: BaseDialogResponseStatus.Success });
    }
}
