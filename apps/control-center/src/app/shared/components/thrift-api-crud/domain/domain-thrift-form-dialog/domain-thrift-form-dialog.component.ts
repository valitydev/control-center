import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DEFAULT_DIALOG_CONFIG, DialogModule, DialogSuperclass } from '@vality/matez';
import { ValueType } from '@vality/thrift-ts';
import { Observable } from 'rxjs';
import { DeepPartial } from 'utility-types';

import { DomainThriftFormComponent } from '../domain-thrift-form';

@Component({
    standalone: true,
    templateUrl: 'domain-thrift-form-dialog.component.html',
    imports: [DialogModule, DomainThriftFormComponent, MatButtonModule, ReactiveFormsModule],
})
export class DomainThriftFormDialogComponent<T = unknown, R = unknown> extends DialogSuperclass<
    DomainThriftFormDialogComponent<T, R>,
    {
        type: ValueType;
        title: string;
        action: (object: T) => Observable<R>;
        namespace?: string;
        object?: T extends object ? DeepPartial<T> : T;
        actionType?: 'create' | 'update';
    },
    { object?: T; result?: R; error?: unknown }
> {
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    control = this.fb.control<T>((this.dialogData.object as T) ?? null);

    get actionType() {
        return (
            this.dialogData.actionType ??
            (this.dialogData.object !== undefined ? 'update' : 'create')
        );
    }

    constructor(
        private fb: FormBuilder,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    upsert() {
        this.dialogData
            .action(this.control.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (result) => {
                    this.closeWithSuccess({ object: this.control.value, result });
                },
                error: (error) => {
                    this.closeWithError({ error });
                },
            });
    }
}
