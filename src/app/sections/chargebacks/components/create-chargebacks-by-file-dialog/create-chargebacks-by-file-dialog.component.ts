import { Component, Injector, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import {
    DialogSuperclass,
    NotifyLogService,
    loadFileContent,
    DEFAULT_DIALOG_CONFIG,
    Column,
    forkJoinToResult,
} from '@vality/ng-core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, map, shareReplay, tap, startWith } from 'rxjs/operators';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { parseCsv, unifyCsvItems } from '@cc/utils';

import { CsvChargeback } from './types/csv-chargeback';
import { CSV_CHARGEBACK_PROPS } from './types/csv-chargeback-props';
import { csvChargebacksToInvoicePaymentChargebackParams } from './utils/csv-chargebacks-to-invoice-payment-chargeback-params';

@UntilDestroy()
@Component({
    selector: 'cc-create-chargebacks-by-file-dialog',
    templateUrl: './create-chargebacks-by-file-dialog.component.html',
})
export class CreateChargebacksByFileDialogComponent
    extends DialogSuperclass<
        CreateChargebacksByFileDialogComponent,
        void,
        InvoicePaymentChargeback[]
    >
    implements OnInit
{
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    hasHeaderControl = new FormControl(true);
    progress$ = new BehaviorSubject(0);
    upload$ = new BehaviorSubject<File | null>(null);
    columns: Column<CsvChargeback>[] = CSV_CHARGEBACK_PROPS.map((c) => ({ field: c, header: c }));
    defaultFormat = CSV_CHARGEBACK_PROPS.join(';');
    selectedChargebacks: CsvChargeback[] = [];
    chargebacks$ = combineLatest([
        this.upload$,
        this.hasHeaderControl.valueChanges.pipe(startWith(null)),
    ]).pipe(
        switchMap(([file]) => loadFileContent(file)),
        map((content) =>
            parseCsv(content, { header: this.hasHeaderControl.value || false, delimiter: ';' }),
        ),
        tap((d) => {
            if (!d.errors.length) return;
            if (d.errors.length === 1) this.log.error(d.errors[0]);
            this.log.error(new Error(d.errors.map((e) => e.message).join('. ')));
        }),
        map((d) => {
            const chargebacks = unifyCsvItems(d?.data, CSV_CHARGEBACK_PROPS);
            if (chargebacks[0].invoice_id) return chargebacks;
            this.log.error(
                'Perhaps you incorrectly checked the checkbox to have or not a header (the first element does not have at least an invoice ID)',
            );
            return [];
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    successfullyChargebacks: InvoicePaymentChargeback[] = [];

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.chargebacks$.pipe(untilDestroyed(this)).subscribe((c) => {
            this.selectedChargebacks = c || [];
        });
    }

    create() {
        const selected = this.selectedChargebacks;
        forkJoinToResult(
            selected.map((c) =>
                this.invoicingService.CreateChargeback(
                    c.invoice_id,
                    c.payment_id,
                    csvChargebacksToInvoicePaymentChargebackParams(c),
                ),
            ),
            2,
            this.progress$,
        )
            .pipe(untilDestroyed(this))
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
                        this.selectedChargebacks = chargebacksWithError.map(
                            (c) => selected[c.index],
                        );
                    } else {
                        this.log.successOperation('create', 'chargebacks');
                        this.closeWithSuccess();
                    }
                },
                error: (err) => this.log.error(err),
            });
    }

    async loadFile(file: File) {
        this.upload$.next(file);
    }

    override closeWithSuccess() {
        super.closeWithSuccess(this.successfullyChargebacks);
    }
}
