import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import {
    DEFAULT_DIALOG_CONFIG,
    DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    progressTo,
} from '@vality/matez';
import { ThriftViewerModule } from '@vality/ng-thrift';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
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
    static override defaultDialogConfig = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

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
