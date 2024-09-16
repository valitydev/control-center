import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { StatPayment } from '@vality/magista-proto/magista';
import { LoadOptions, Column2, createMenuColumn, TABLE_WRAPPER_STYLE } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

import { AmountCurrencyService } from '@cc/app/shared/services';

import { createFailureColumn2 } from '../../../../shared';
import {
    createPartyColumn,
    createShopColumn,
    createDomainObjectColumn,
    createCurrencyColumn,
} from '../../../../shared/utils/table2';

@Component({
    selector: 'cc-payments-table',
    templateUrl: './payments-table.component.html',
    host: { style: TABLE_WRAPPER_STYLE },
})
export class PaymentsTableComponent {
    @Input() data!: StatPayment[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    @Input() selected?: StatPayment[];

    @Output() selectedChange = new EventEmitter<StatPayment[]>();
    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column2<StatPayment>[] = [
        {
            field: 'id',
            cell: (d) => ({
                click: () => this.toDetails(d),
            }),
        },
        { field: 'invoice_id', sticky: 'start' },
        { field: 'external_id' },
        createCurrencyColumn((d) => ({ amount: d.amount, code: d.currency_symbolic_code }), {
            field: 'amount',
        }),
        createCurrencyColumn((d) => ({ amount: d.fee, code: d.currency_symbolic_code }), {
            field: 'fee',
        }),
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getUnionKey(d.status)),
                color: (
                    {
                        captured: 'success',
                        refunded: 'success',
                        charged_back: 'success',
                        pending: 'pending',
                        processed: 'pending',
                        failed: 'warn',
                        cancelled: 'neutral',
                    } as const
                )[getUnionKey(d.status)],
            }),
        },
        { field: 'created_at', cell: { type: 'datetime' } },
        createPartyColumn((d) => ({ id: d.owner_id })),
        createShopColumn((d) => ({ partyId: d.owner_id, shopId: d.shop_id })),
        { field: 'domain_revision' },
        createDomainObjectColumn((d) => ({ ref: { terminal: d.terminal_id } }), {
            header: 'Terminal',
        }),
        createDomainObjectColumn((d) => ({ ref: { provider: d.provider_id } }), {
            header: 'Provider',
        }),
        createFailureColumn2((d) => ({
            failure: d.status?.failed?.failure?.failure,
            noFailureMessage:
                getUnionKey(d.status?.failed?.failure) === 'failure'
                    ? ''
                    : startCase(getUnionKey(d.status?.failed?.failure)),
        })),
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () => this.toDetails(d),
                },
            ],
        })),
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
