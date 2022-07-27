import { Component, EventEmitter, Input, Output } from '@angular/core';
import { coerceBoolean } from 'coerce-property';

import { BaseDialogResponseStatus } from './types/base-dialog-response-status';

@Component({
    selector: 'cc-base-dialog',
    templateUrl: 'base-dialog.component.html',
    styleUrls: ['base-dialog.component.scss'],
})
export class BaseDialogComponent {
    @Input() title!: string;

    @coerceBoolean @Input() disabled = false;
    @coerceBoolean @Input() inProgress = false;

    @coerceBoolean @Input() hasDivider = true;

    @coerceBoolean @Input() noContent = false;
    @coerceBoolean @Input() noActions = false;

    @Output() cancel = new EventEmitter<void>();

    cancelData = {
        status: BaseDialogResponseStatus.Cancelled,
    };

    cancelDialog(): void {
        this.cancel.emit();
    }
}
