import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InvoicePaymentStatus } from '@vality/domain-proto/domain';
import { StatPayment } from '@vality/magista-proto/magista';
import { Column, TagColumn, LoadOptions } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { PartiesStoreService } from '@cc/app/api/payment-processing';
import { AmountCurrencyService } from '@cc/app/shared/services';
import { getUnionKey } from '@cc/utils';

@Component({
    selector: 'cc-payments-table',
    templateUrl: './payments-table.component.html',
})
export class PaymentsTableComponent {
    @Input() data!: StatPayment[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    @Input() selected?: StatPayment[];

    @Output() selectedChange = new EventEmitter<StatPayment[]>();
    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column<StatPayment>[] = [
        'id',
        'invoice_id',
        {
            field: 'amount',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.amount, data.currency_symbolic_code),
            typeParameters: {
                currencyCode: 'currency_symbolic_code',
            },
        },
        {
            field: 'fee',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.fee, data.currency_symbolic_code),
            typeParameters: {
                currencyCode: 'currency_symbolic_code',
            },
        },
        {
            field: 'status',
            type: 'tag',
            formatter: (data) => startCase(getUnionKey(data.status)),
            typeParameters: {
                value: (data) => getUnionKey(data.status),
                tags: {
                    pending: { color: 'pending' },
                    processed: { color: 'pending' },
                    captured: { color: 'success' },
                    cancelled: {},
                    refunded: { color: 'success' },
                    failed: { color: 'warn' },
                    charged_back: { color: 'success' },
                },
            },
        } as TagColumn<StatPayment, keyof InvoicePaymentStatus>,
        { field: 'created_at', type: 'datetime' },
        {
            field: 'owner_id',
            header: 'Party',
            formatter: (data) =>
                this.partiesStoreService.get(data.owner_id).pipe(map((p) => p.contact_info.email)),
            description: 'owner_id',
        },
        {
            field: 'shop',
            formatter: (data) =>
                this.partiesStoreService
                    .get(data.owner_id)
                    .pipe(map((p) => p.shops.get(data.shop_id).details.name)),
            description: 'shop_id',
            header: 'Shop',
        },
        'domain_revision',
        { field: 'terminal_id.id', header: 'Terminal' },
        { field: 'provider_id.id', header: 'Provider' },
    ];

    constructor(
        private amountCurrencyService: AmountCurrencyService,
        private partiesStoreService: PartiesStoreService
    ) {}
}
