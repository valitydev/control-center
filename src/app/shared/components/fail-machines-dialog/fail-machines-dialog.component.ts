import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ID } from '@vality/machinegun-proto/internal/base';
import {
    DialogSuperclass,
    NotifyLogService,
    forkJoinToResult,
    splitResultsErrors,
    ForkJoinErrorResult,
    DialogModule,
} from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { AutomatonService, FAILS_MACHINE_VALUE, Namespace } from '../../../api/machinegun';

@UntilDestroy()
@Component({
    standalone: true,
    templateUrl: './fail-machines-dialog.component.html',
    imports: [CommonModule, DialogModule, MatButtonModule],
})
export class FailMachinesDialogComponent extends DialogSuperclass<
    FailMachinesDialogComponent,
    { ids: ID[]; ns: Namespace },
    { errors?: ForkJoinErrorResult<ID>[] }
> {
    progress$ = new BehaviorSubject(0);
    errors: ForkJoinErrorResult<ID>[] = [];

    constructor(
        private automatonService: AutomatonService,
        private log: NotifyLogService,
    ) {
        super();
    }

    fail() {
        const ids = this.errors.length ? this.errors.map(({ data }) => data) : this.dialogData.ids;
        this.errors = [];
        forkJoinToResult(
            ids.map((id) =>
                this.automatonService.Call(
                    {
                        ns: this.dialogData.ns,
                        ref: { id },
                        range: { limit: 1, direction: 1 },
                    },
                    FAILS_MACHINE_VALUE,
                ),
            ),
            this.progress$,
            ids,
        )
            .pipe(untilDestroyed(this))
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
