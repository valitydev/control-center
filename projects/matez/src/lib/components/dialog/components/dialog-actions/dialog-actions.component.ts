import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'v-dialog-actions',
    templateUrl: './dialog-actions.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class DialogActionsComponent {}
