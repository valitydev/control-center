import { CommonModule } from '@angular/common';
import { Component, DestroyRef, runInInjectionContext, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { DepositState } from '@vality/fistful-proto/internal/deposit';
import {
    DialogSuperclass,
    NotifyLogService,
    DEFAULT_DIALOG_CONFIG,
    DialogModule,
    forkJoinToResult,
} from '@vality/ng-core';
import { BehaviorSubject, switchMap } from 'rxjs';

import { UploadCsvComponent } from '../../../../../components/upload-csv';
import { DepositManagementService } from '../../../../api/deposit';

import { CSV_DEPOSIT_PROPS, CsvDeposit } from './types/csv-deposit';
import { getCreateDepositArgs } from './utils/get-create-deposit-args';

@Component({
    standalone: true,
    selector: 'cc-create-deposits-by-file-dialog',
    templateUrl: './create-deposits-by-file-dialog.component.html',
    imports: [DialogModule, UploadCsvComponent, CommonModule, MatButton],
})
export class CreateDepositsByFileDialogComponent extends DialogSuperclass<
    CreateDepositsByFileDialogComponent,
    void,
    DepositState[]
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    progress$ = new BehaviorSubject(0);
    selected: CsvDeposit[] = [];
    successfully: DepositState[] = [];
    props = CSV_DEPOSIT_PROPS;
    errors?: Map<CsvDeposit, unknown>;

    constructor(
        private depositManagementService: DepositManagementService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
        private injector: Injector,
    ) {
        super();
    }

    create() {
        const selected = this.selected;
        forkJoinToResult(
            selected.map((c) =>
                runInInjectionContext(this.injector, () => getCreateDepositArgs(c)).pipe(
                    switchMap((params) => this.depositManagementService.Create(...params)),
                ),
            ),
            this.progress$,
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.successfully.push(...res.filter((c) => !c.hasError).map((c) => c.result));
                    const withError = res.filter((c) => c.hasError);
                    if (withError.length) {
                        this.log.error(
                            withError.map((c) => c.error),
                            `Creating ${withError.length} deposits ended in an error. They were re-selected in the table.`,
                        );
                        this.selected = withError.map((c) => selected[c.index]);
                        this.errors = new Map(withError.map((c) => [selected[c.index], c.error]));
                    } else {
                        this.log.successOperation('create', 'deposits');
                        this.closeWithSuccess();
                    }
                },
                error: (err) => this.log.error(err),
            });
    }

    override closeWithSuccess() {
        super.closeWithSuccess(this.successfully);
    }
}
