import { CommonModule } from '@angular/common';
import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import {
    DialogSuperclass,
    DEFAULT_DIALOG_CONFIG,
    DialogModule,
    NotifyLogService,
    progressTo,
} from '@vality/ng-core';
import { Observable, BehaviorSubject } from 'rxjs';

import { ThriftViewerModule } from '../../thrift-viewer';

@Component({
    standalone: true,
    templateUrl: './update-thrift-dialog.component.html',
    imports: [CommonModule, DialogModule, ThriftViewerModule, MatButton],
})
export class UpdateThriftDialogComponent<T> extends DialogSuperclass<
    UpdateThriftDialogComponent<T>,
    {
        title?: string;
        prevObject: T;
        object: T;
        action?: () => Observable<unknown>;
    },
    { object: T }
> {
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    progress$ = new BehaviorSubject(0);

    private destroyRef = inject(DestroyRef);
    private log = inject(NotifyLogService);

    override closeWithSuccess() {
        if (this.dialogData.action) {
            this.dialogData
                .action()
                .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: () => {
                        super.closeWithSuccess({ object: this.dialogData.object });
                    },
                    error: (err) => {
                        this.log.error(err);
                        this.closeWithError();
                    },
                });
        } else {
            super.closeWithSuccess({ object: this.dialogData.object });
        }
    }
}
