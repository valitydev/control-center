import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InvoicePaymentChargebackStatus } from '@vality/magista-proto/internal/proto/domain';
import { StatChargeback } from '@vality/magista-proto/magista';
import { LoadOptions, Column, TagColumn } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';

import { getUnionKey } from '../../../../../utils';
import { AmountCurrencyService } from '../../../../shared/services';

@Component({
    selector: 'cc-chargebacks-table',
    templateUrl: './chargebacks-table.component.html',
    styles: [],
})
export class ChargebacksTableComponent {
    @Input() data!: StatChargeback[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    @Input() selected?: StatChargeback[];

    @Output() selectedChange = new EventEmitter<StatChargeback[]>();
    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column<StatChargeback>[] = [
        { field: 'chargeback_id', header: 'Id', pinned: 'left' },
        {
            field: 'chargeback_reason',
            header: 'Reason',
            formatter: (data) => startCase(getUnionKey(data.chargeback_reason.category)),
            description: (data) => data.chargeback_reason.code,
        },
        {
            field: 'chargeback_status',
            type: 'tag',
            header: 'Status',
            formatter: (data) => getUnionKey(data.chargeback_status),
            typeParameters: {
                label: (data) => startCase(getUnionKey(data.chargeback_status)),
                tags: {
                    pending: { color: 'pending' },
                    accepted: { color: 'success' },
                    rejected: { color: 'warn' },
                },
            },
        } as TagColumn<StatChargeback, keyof InvoicePaymentChargebackStatus>,
        {
            field: 'amount',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.amount, data.currency_code.symbolic_code),
            typeParameters: {
                currencyCode: (data) => data.currency_code.symbolic_code,
            },
        },
        {
            field: 'levy_amount',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.amount, data.currency_code.symbolic_code),
            typeParameters: {
                currencyCode: (data) => data.levy_currency_code.symbolic_code,
            },
        },
        {
            field: 'fee',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.amount, data.currency_code.symbolic_code),
            typeParameters: {
                currencyCode: (data) => data.currency_code.symbolic_code,
            },
        },
        {
            field: 'provider_fee',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.amount, data.currency_code.symbolic_code),
            typeParameters: {
                currencyCode: (data) => data.currency_code.symbolic_code,
            },
        },
        {
            field: 'external_fee',
            type: 'currency',
            formatter: (data) =>
                this.amountCurrencyService.toMajor(data.amount, data.currency_code.symbolic_code),
            typeParameters: {
                currencyCode: (data) => data.currency_code.symbolic_code,
            },
        },
        {
            field: 'stage',
            formatter: (data) => getUnionKey(data.stage),
        },
        {
            field: 'invoice_id',
            header: 'Invoice Id (Payment Id)',
            description: 'payment_id',
            link: (data) =>
                `/party/${data.party_id}/invoice/${data.invoice_id}/payment/${data.payment_id}`,
        },
        {
            field: 'created_at',
            type: 'datetime',
        },
        {
            field: 'party_id',
            header: 'Party',
        },
        {
            field: 'shop_id',
            header: 'Shop',
        },
        {
            field: 'external_id',
            hide: true,
        },
        {
            field: 'content.type',
            description: 'content.data',
            header: 'Content',
            hide: true,
        },
        // createOperationColumn<StatChargeback>([
        //     {
        //         label: 'Change status',
        //         click: (data) => undefined,
        //     },
        // ]),
    ];

    constructor(private amountCurrencyService: AmountCurrencyService) {}
}
