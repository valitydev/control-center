import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Automaton, type base } from '@vality/machinegun-proto/state_processing';
import {
    DialogModule,
    DialogSuperclass,
    ForkJoinErrorResult,
    NotifyLogService,
    Option,
    SelectFieldModule,
    forkJoinToResult,
    getEnumKey,
    splitResultsErrors,
} from '@vality/matez';
import startCase from 'lodash-es/startCase';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FAILS_MACHINE_VALUE, Namespace } from '~/api/machinegun';

export enum Type {
    Invoice,
    Withdrawal,
}

const TYPE_NS_MAP: Record<Type, Namespace[]> = {
    [Type.Invoice]: [Namespace.Invoice],
    [Type.Withdrawal]: [Namespace.Withdrawal, Namespace.WithdrawalSession],
};

@Component({
    templateUrl: './fail-machines-dialog.component.html',
    imports: [CommonModule, DialogModule, MatButtonModule, ReactiveFormsModule, SelectFieldModule],
})
export class FailMachinesDialogComponent extends DialogSuperclass<
    FailMachinesDialogComponent,
    { ids: base.ID[]; type: Type },
    { errors?: ForkJoinErrorResult<base.ID>[] }
> {
    private automatonService = inject(Automaton);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    progress$ = new BehaviorSubject(0);
    errors: ForkJoinErrorResult<base.ID>[] = [];
    nsControl = new FormControl<Namespace>(TYPE_NS_MAP[this.dialogData.type][0]);
    nsOptions: Option<Namespace>[] = TYPE_NS_MAP[this.dialogData.type].map((ns) => ({
        label: startCase(getEnumKey(Namespace, ns)),
        description: ns,
        value: ns,
    }));

    get hasNsControl() {
        return TYPE_NS_MAP[this.dialogData.type].length > 1;
    }

    fail() {
        const ids = this.errors.length ? this.errors.map(({ data }) => data) : this.dialogData.ids;
        this.errors = [];
        forkJoinToResult(
            ids.map((id) =>
                this.automatonService
                    .Call(
                        {
                            ns: this.nsControl.value,
                            ref: { id },
                            range: { limit: 1, direction: 1 },
                        },
                        FAILS_MACHINE_VALUE,
                    )
                    .pipe(
                        catchError((err) => {
                            if (err?.error?.name === 'MachineFailed') {
                                return of(err?.error);
                            }
                            throw err?.error;
                        }),
                    ),
            ),
            this.progress$,
            ids,
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                const [result, errors] = splitResultsErrors(res);
                if (errors.length) {
                    this.errors = errors;
                    this.log.error(this.errors.map((e) => e.error));
                } else {
                    this.log.success(`${result.length} failed successfully`);
                    this.closeWithSuccess();
                }
            });
    }

    closeAndSelectWithAnError() {
        this.closeWithError({ errors: this.errors });
    }
}
