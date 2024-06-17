import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import {
    DialogSuperclass,
    NotifyLogService,
    DEFAULT_DIALOG_CONFIG,
    forkJoinToResult,
} from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { InvoicingService } from '@cc/app/api/payment-processing';

import { CSV_CHARGEBACK_PROPS, CsvChargeback } from './types/csv-chargeback';
import { getCreateChargebackArgs } from './utils/get-create-chargeback-args';

@Component({
    selector: 'cc-create-chargebacks-by-file-dialog',
    templateUrl: './create-chargebacks-by-file-dialog.component.html',
})
export class CreateChargebacksByFileDialogComponent extends DialogSuperclass<
    CreateChargebacksByFileDialogComponent,
    void,
    InvoicePaymentChargeback[]
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    progress$ = new BehaviorSubject(0);
    selected: CsvChargeback[] = [];
    successfullyChargebacks: InvoicePaymentChargeback[] = [];
    props = CSV_CHARGEBACK_PROPS;

    constructor(
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

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
