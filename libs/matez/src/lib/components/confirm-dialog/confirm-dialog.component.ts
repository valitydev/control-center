import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DialogSuperclass } from '../dialog';

@Component({
    selector: 'v-action-dialog',
    templateUrl: 'confirm-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ConfirmDialogComponent extends DialogSuperclass<
    ConfirmDialogComponent,
    { title?: string; confirmLabel?: string; hasReason?: boolean; description?: string } | void,
    { reason?: string }
> {
    control = new FormControl<string>('', { nonNullable: true });

    confirm() {
        this.closeWithSuccess(
            this.dialogData && this.dialogData?.hasReason
                ? { reason: this.control.value }
                : undefined,
        );
    }
}
