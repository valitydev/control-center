import { Component, Injector, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import { InvoicePaymentChargebackParams } from '@vality/domain-proto/payment_processing';
import {
    DialogSuperclass,
    NotifyLogService,
    loadFileContent,
    DEFAULT_DIALOG_CONFIG,
    forkJoinToResult,
    Column,
} from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, map, shareReplay, tap, startWith } from 'rxjs/operators';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { parseCsv, unifyCsvItems, getUnionKey } from '@cc/utils';

import { AmountCurrencyService } from '../../../../shared/services';

import { CSV_CHARGEBACK_PROPS } from './types/csv-chargeback-props';
import { csvChargebacksToInvoicePaymentChargebackParams } from './utils/csv-chargebacks-to-invoice-payment-chargeback-params';

interface ChargebackParams {
    invoiceId: string;
    paymentId: string;
    params: InvoicePaymentChargebackParams;
}

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
    columns: Column<ChargebackParams>[] = [
        { field: 'invoiceId', pinned: 'left' },
        { field: 'paymentId', pinned: 'left' },
        // { field: 'params.id', pinned: 'left' },
        {
            field: 'params.reason',
            formatter: ({ params }) => startCase(getUnionKey(params.reason.category)),
            description: ({ params }) => params.reason.code,
        },
        {
            field: 'levy',
            type: 'currency',
            formatter: ({ params }) =>
                this.amountCurrencyService.toMajor(
                    params.levy.amount,
                    params.levy.currency.symbolic_code,
                ),
            typeParameters: {
                currencyCode: ({ params }) => params.levy.currency.symbolic_code,
            },
        },
        {
            field: 'params.body',
            type: 'currency',
            formatter: ({ params }) =>
                this.amountCurrencyService.toMajor(
                    params.body?.amount,
                    params.body?.currency?.symbolic_code,
                ),
            typeParameters: {
                currencyCode: ({ params }) => params.body?.currency?.symbolic_code,
            },
        },
        {
            field: 'params.transaction_info.id',
            header: 'Transaction id',
        },
        {
            field: 'params.transaction_info.timestamp',
            header: 'Transaction timestamp',
            type: 'datetime',
        },
        {
            field: 'params.external_id',
        },
        {
            field: 'params.occurred_at',
            type: 'datetime',
        },
    ];
    defaultFormat = CSV_CHARGEBACK_PROPS.join(';');
    selectedChargebacks: ChargebackParams[] = [];
    chargebacks$ = combineLatest([
        this.upload$,
        this.hasHeaderControl.valueChanges.pipe(startWith(null)),
    ]).pipe(
        switchMap(([file]) => loadFileContent(file)),
        map((content) =>
            parseCsv(content, { header: this.hasHeaderControl.value || false, delimiter: ';' }),
        ),
        tap((d) => {
            if (!d.errors.length) {
                return;
            }
            if (d.errors.length === 1) {
                this.log.error(d.errors[0]);
            }
            this.log.error(new Error(d.errors.map((e) => e.message).join('. ')));
        }),
        map((d) => {
            const chargebacks = unifyCsvItems(d?.data, CSV_CHARGEBACK_PROPS);
            if (chargebacks[0].invoice_id) {
                return chargebacks;
            }
            this.log.error(
                'Perhaps you incorrectly checked the checkbox to have or not a header (the first element does not have at least an invoice ID)',
            );
            return [];
        }),
        map((chargebacks) =>
            chargebacks.map((c) => ({
                invoiceId: c.invoice_id as string,
                paymentId: c.payment_id as string,
                params: csvChargebacksToInvoicePaymentChargebackParams(c),
            })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    successfullyChargebacks: InvoicePaymentChargeback[] = [];

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
        private amountCurrencyService: AmountCurrencyService,
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
                this.invoicingService.CreateChargeback(c.invoiceId, c.paymentId, c.params),
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
