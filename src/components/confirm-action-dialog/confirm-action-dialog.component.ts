import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseDialogResponseStatus, BaseDialogSuperclass } from '@vality/ng-core';

@Component({
    selector: 'cc-confirm-action-dialog',
    templateUrl: 'confirm-action-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmActionDialogComponent extends BaseDialogSuperclass<
    ConfirmActionDialogComponent,
    { title?: string; confirmLabel?: string; hasReason?: boolean } | void,
    { reason?: string }
> {
    control = new FormControl<string>('');

    cancel() {
        this.dialogRef.close({ status: BaseDialogResponseStatus.Cancelled });
    }

    confirm() {
        this.dialogRef.close({
            status: BaseDialogResponseStatus.Success,
            data:
                this.dialogData && this.dialogData.hasReason
                    ? { reason: this.control.value }
                    : null,
        });
    }
}
