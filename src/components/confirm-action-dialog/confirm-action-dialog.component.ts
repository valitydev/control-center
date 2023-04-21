import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogResponseStatus, DialogSuperclass } from '@vality/ng-core';

@Component({
    selector: 'cc-confirm-action-dialog',
    templateUrl: 'confirm-action-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmActionDialogComponent extends DialogSuperclass<
    ConfirmActionDialogComponent,
    { title?: string; confirmLabel?: string; hasReason?: boolean } | void,
    { reason?: string }
> {
    control = new FormControl<string>('');

    cancel() {
        this.dialogRef.close({ status: DialogResponseStatus.Cancelled });
    }

    confirm() {
        this.dialogRef.close({
            status: DialogResponseStatus.Success,
            data:
                this.dialogData && this.dialogData.hasReason
                    ? { reason: this.control.value }
                    : null,
        });
    }
}
