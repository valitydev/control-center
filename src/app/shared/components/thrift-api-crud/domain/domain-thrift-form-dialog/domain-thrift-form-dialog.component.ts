import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogSuperclass, DialogModule, DEFAULT_DIALOG_CONFIG } from '@vality/ng-core';
import { ValueType } from '@vality/thrift-ts';
import { Observable } from 'rxjs';

import { DomainThriftFormComponent } from '../domain-thrift-form';

@UntilDestroy()
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
        object?: T;
        actionType?: 'create' | 'update';
    },
    { object?: T; result?: R; error?: unknown }
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    control = this.fb.control(this.dialogData.object ?? null);

    get actionType() {
        return (
            this.dialogData.actionType ??
            (this.dialogData.object !== undefined ? 'update' : 'create')
        );
    }

    constructor(private fb: FormBuilder) {
        super();
    }

    upsert() {
        this.dialogData
            .action(this.control.value)
            .pipe(untilDestroyed(this))
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
