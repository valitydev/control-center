import { BehaviorSubject } from 'rxjs';

import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import {
    DEFAULT_DIALOG_CONFIG,
    DialogSuperclass,
    NotifyLogService,
    forkJoinToResult,
} from '@vality/matez';

import { ThriftInvoicingService } from '~/api/services';

import { CSV_CHARGEBACK_PROPS, CsvChargeback } from './types/csv-chargeback';
import { getCreateChargebackArgs } from './utils/get-create-chargeback-args';

@Component({
    selector: 'cc-create-chargebacks-by-file-dialog',
    templateUrl: './create-chargebacks-by-file-dialog.component.html',
    standalone: false,
})
export class CreateChargebacksByFileDialogComponent extends DialogSuperclass<
    CreateChargebacksByFileDialogComponent,
    void,
    InvoicePaymentChargeback[]
> {
    private invoicingService = inject(ThriftInvoicingService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    progress$ = new BehaviorSubject(0);
    selected: CsvChargeback[] = [];
    successfullyChargebacks: InvoicePaymentChargeback[] = [];
    props = CSV_CHARGEBACK_PROPS;
    errors?: Map<CsvChargeback, unknown>;

    create() {
        const selected = this.selected;
        forkJoinToResult(
            selected.map((c) =>
                this.invoicingService.CreateChargeback(...getCreateChargebackArgs(c)),
            ),
            this.progress$,
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.successfullyChargebacks.push(
                        ...res.filter((c) => !c.hasError).map((c) => c.result),
                    );
                    const chargebacksWithError = res.filter((c) => c.hasError);
                    if (chargebacksWithError.length) {
                        this.log.error(
                            chargebacksWithError.map((c) => c.error),
                            `Creating ${chargebacksWithError.length} chargebacks ended in an error. They were re-selected in the table.`,
                        );
                        this.selected = chargebacksWithError.map((c) => selected[c.index]);
                        this.errors = new Map(
                            chargebacksWithError.map((c) => [selected[c.index], c.error]),
                        );
                    } else {
                        this.log.successOperation('create', 'chargebacks');
                        this.closeWithSuccess();
                    }
                },
                error: (err) => this.log.error(err),
            });
    }

    override closeWithSuccess() {
        super.closeWithSuccess(this.successfullyChargebacks);
    }
}
