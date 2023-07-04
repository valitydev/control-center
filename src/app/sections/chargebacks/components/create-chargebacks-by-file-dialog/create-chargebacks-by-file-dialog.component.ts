import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentChargebackParams } from '@vality/domain-proto/payment_processing';
import {
    DialogSuperclass,
    NotifyLogService,
    loadFileContent,
    DEFAULT_DIALOG_CONFIG,
    Column,
    clean,
} from '@vality/ng-core';
import { of, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { switchMap, map, shareReplay, first, tap, startWith } from 'rxjs/operators';
import * as short from 'short-uuid';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { parseCsv } from '@cc/app/shared';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

const CSV_PROPS_BY_ORDER = [
    'invoice_id',
    'payment_id',

    'reason.category',
    'reason.code',

    'levy.amount',
    'levy.currency.symbolic_code',

    // Optional
    'body.amount',
    'body.currency.symbolic_code',

    'external_id',
    'occurred_at',

    'context.type',
    'context.data',

    'transaction_info.id',
    'transaction_info.timestamp',
    'transaction_info.extra',
] as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CsvChargeback = Record<(typeof CSV_PROPS_BY_ORDER)[number], any>;

function csvToThriftChargeback(c: CsvChargeback): InvoicePaymentChargebackParams {
    return clean(
        {
            id: short().uuid(),
            reason: {
                code: c['reason.code'],
                category: { [c['reason.category']]: {} },
            },
            levy: {
                amount: c['levy.amount'],
                currency: {
                    symbolic_code: c['levy.currency.symbolic_code'],
                },
            },
            body: clean(
                {
                    amount: c['body.amount'],
                    currency: {
                        symbolic_code: c['body.currency.symbolic_code'],
                    },
                },
                true
            ),
            transaction_info: clean(
                {
                    id: c['transaction_info.id'],
                    timestamp: c['transaction_info.timestamp'],
                    extra: c['transaction_info.extra'],
                    additional_info: c['transaction_info.additional_info']
                        ? JSON.parse(c['transaction_info.additional_info'])
                        : undefined,
                },
                true
            ),
            external_id: c.external_id,
            context: clean(
                {
                    type: c['context.type'],
                    data: c['context.data'],
                },
                true
            ),
            occurred_at: c['occurred_at'],
        },
        false,
        true
    );
}

function csvFormatChargeback(csv: CsvChargeback[] | string[][]): CsvChargeback[] {
    if (!Array.isArray(csv)) return [];
    if (Array.isArray(csv?.[0])) {
        return csv.map((d) =>
            Object.fromEntries(d.map((prop, idx) => [CSV_PROPS_BY_ORDER[idx], prop]))
        ) as CsvChargeback[];
    }
    return csv as CsvChargeback[];
}

@UntilDestroy()
@Component({
    selector: 'cc-create-chargebacks-by-file-dialog',
    templateUrl: './create-chargebacks-by-file-dialog.component.html',
})
export class CreateChargebacksByFileDialogComponent extends DialogSuperclass<CreateChargebacksByFileDialogComponent> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    hasHeaderControl = new FormControl(true);

    extensions$ = of([]);
    upload$ = new BehaviorSubject<File | null>(null);
    chargebacks$ = combineLatest([
        this.upload$,
        this.hasHeaderControl.valueChanges.pipe(startWith(null)),
    ]).pipe(
        switchMap(([file]) => loadFileContent(file)),
        map((content) =>
            parseCsv(content, { header: this.hasHeaderControl.value || false, delimiter: ';' })
        ),
        tap((d) => {
            if (!d.errors.length) return;
            if (d.errors.length === 1) this.log.error(d.errors[0]);
            this.log.error(new Error(d.errors.map((e) => e.message).join('. ')));
        }),
        map((d) => {
            const chargebacks = csvFormatChargeback(d?.data);
            if (chargebacks[0].invoice_id) return chargebacks;
            this.log.error(
                new Error(
                    'Perhaps you incorrectly checked the checkbox to have or not a header (the first element does not have at least an invoice ID)'
                )
            );
            return [];
        }),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    columns: Column<CsvChargeback>[] = CSV_PROPS_BY_ORDER.map((c) => ({ field: c, header: c }));
    defaultFormat = CSV_PROPS_BY_ORDER.join(';');

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private notificationErrorService: NotificationErrorService,
        private log: NotifyLogService
    ) {
        super(injector);
    }

    create() {
        this.chargebacks$
            .pipe(
                first(),
                switchMap((chargebacks) =>
                    merge(
                        ...chargebacks.map((c) =>
                            this.invoicingService.CreateChargeback(
                                c.invoice_id,
                                c.payment_id,
                                csvToThriftChargeback(c)
                            )
                        ),
                        4
                    )
                ),
                untilDestroyed(this)
            )
            .subscribe({
                next: () => {
                    this.log.success('Chargeback created');
                    this.closeWithSuccess();
                },
                error: this.notificationErrorService.error,
            });
    }

    async loadFile(file: File) {
        this.upload$.next(file);
    }
}
