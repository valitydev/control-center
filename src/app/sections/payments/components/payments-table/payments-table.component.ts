import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { InvoicePaymentStatus } from '@vality/domain-proto/domain';
import { StatPayment } from '@vality/magista-proto/magista';
import { Column, TagColumn, LoadOptions, createOperationColumn } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';

import { AmountCurrencyService } from '@cc/app/shared/services';
import { getUnionKey } from '@cc/utils';

import { createFailureColumn, createPartyColumn, createShopColumn } from '../../../../shared';
import { createProviderColumn } from '../../../../shared/utils/table/create-provider-column';
import { createTerminalColumn } from '../../../../shared/utils/table/create-terminal-column';

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
        { field: 'id', click: (d) => this.toDetails(d), pinned: 'left' },
        { field: 'invoice_id', pinned: 'left' },
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
            formatter: (data) => getUnionKey(data.status),
            typeParameters: {
                label: (data) => startCase(getUnionKey(data.status)),
                tags: {
                    captured: { color: 'success' },
                    refunded: { color: 'success' },
                    charged_back: { color: 'success' },
                    pending: { color: 'pending' },
                    processed: { color: 'pending' },
                    failed: { color: 'warn' },
                    cancelled: { color: 'neutral' },
                },
            },
        } as TagColumn<StatPayment, keyof InvoicePaymentStatus>,
        { field: 'created_at', type: 'datetime' },
        createPartyColumn('owner_id'),
        createShopColumn('shop_id', (d) => d.owner_id),
        'domain_revision',
        createTerminalColumn((d) => d.terminal_id.id),
        createProviderColumn((d) => d.provider_id.id),
        'external_id',
        createFailureColumn<StatPayment>(
            (d) => d.status?.failed?.failure?.failure,
            (d) =>
                getUnionKey(d.status?.failed?.failure) === 'failure'
                    ? ''
                    : startCase(getUnionKey(d.status?.failed?.failure)),
        ),
        createOperationColumn<StatPayment>([
            {
                label: 'Details',
                click: (data) => this.toDetails(data),
            },
        ]),
    ];

    constructor(
        private amountCurrencyService: AmountCurrencyService,
        private router: Router,
    ) {}

    private toDetails(data: StatPayment) {
        return void this.router.navigate([
            'party',
            data.owner_id,
            'invoice',
            data.invoice_id,
            'payment',
            data.id,
        ]);
    }
}
