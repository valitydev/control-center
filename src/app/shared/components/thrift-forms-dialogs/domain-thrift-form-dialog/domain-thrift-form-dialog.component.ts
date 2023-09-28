import { Component, Injector } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogSuperclass, DialogModule } from '@vality/ng-core';
import { ValueType } from '@vality/thrift-ts';
import { Observable } from 'rxjs';

import { DomainThriftFormComponent } from '../../thrift-forms/domain-thrift-form';

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
    },
    { object?: T; result?: R; error?: unknown }
> {
    control = this.fb.control(this.dialogData.object ?? null);

    get isUpdate() {
        return this.dialogData.object !== undefined;
    }

    constructor(
        injector: Injector,
        private fb: FormBuilder,
    ) {
        super(injector);
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
