import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { InvoicePaymentAdjustment } from '@vality/domain-proto/internal/domain';
import {
    DialogSuperclass,
    NotifyLogService,
    DEFAULT_DIALOG_CONFIG,
    forkJoinToResult,
    DialogModule,
} from '@vality/matez';
import { BehaviorSubject } from 'rxjs';

import { UploadCsvComponent } from '../../../../../components/upload-csv';
import { InvoicingService } from '../../../../api/payment-processing/invoicing.service';


import { CSV_PAYMENT_ADJUSTMENT_PROPS, CsvPaymentAdjustment } from './types/csv-payment-adjustment';
import { getCreatePaymentAdjustmentsArgs } from './utils/get-create-payment-adjustments-args';

@Component({
    standalone: true,
    selector: 'cc-create-payment-adjustments-by-file-dialog',
    templateUrl: './create-payment-adjustments-by-file-dialog.component.html',
    imports: [CommonModule, DialogModule, UploadCsvComponent, MatButton],
})
export class CreatePaymentAdjustmentsByFileDialogComponent extends DialogSuperclass<
    CreatePaymentAdjustmentsByFileDialogComponent,
    void,
    InvoicePaymentAdjustment[]
> {
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    progress$ = new BehaviorSubject(0);
    selected: CsvPaymentAdjustment[] = [];
    successfully: InvoicePaymentAdjustment[] = [];
    props = CSV_PAYMENT_ADJUSTMENT_PROPS;
    errors?: Map<CsvPaymentAdjustment, unknown>;

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
                this.invoicingService.CreatePaymentAdjustment(
                    ...getCreatePaymentAdjustmentsArgs(c),
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
                            `Creating ${withError.length} payment adjustments ended in an error. They were re-selected in the table.`,
                        );
                        this.selected = withError.map((c) => selected[c.index]);
                        this.errors = new Map(withError.map((c) => [selected[c.index], c.error]));
                    } else {
                        this.log.successOperation('create', 'payment adjustments');
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
