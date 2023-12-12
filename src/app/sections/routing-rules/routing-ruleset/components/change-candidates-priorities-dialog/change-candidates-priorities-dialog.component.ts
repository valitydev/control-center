import { Component } from '@angular/core';
import { DialogSuperclass, DEFAULT_DIALOG_CONFIG } from '@vality/ng-core';

@Component({
    selector: 'cc-change-candidates-priorities-dialog',
    templateUrl: './change-candidates-priorities-dialog.component.html',
    styles: [],
})
export class ChangeCandidatesPrioritiesDialogComponent<T> extends DialogSuperclass<
    ChangeCandidatesPrioritiesDialogComponent<T>,
    {
        prevObject: T;
        object: T;
    },
    { object: T }
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    closeWithSuccess() {
        super.closeWithSuccess({ object: this.dialogData.object });
    }
}
