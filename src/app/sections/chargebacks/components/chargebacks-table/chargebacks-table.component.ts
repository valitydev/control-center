import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StatChargeback } from '@vality/magista-proto/magista';
import { LoadOptions, Column2, TABLE_WRAPPER_STYLE } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

import {
    createCurrencyColumn,
    createPartyColumn,
    createShopColumn,
} from '@cc/app/shared/utils/table2';

import { AmountCurrencyService } from '../../../../shared/services';

@Component({
    selector: 'cc-chargebacks-table',
    templateUrl: './chargebacks-table.component.html',
    host: {
        style: TABLE_WRAPPER_STYLE,
    },
})
export class ChargebacksTableComponent {
    @Input() data!: StatChargeback[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    @Input() selected?: StatChargeback[];

    @Output() selectedChange = new EventEmitter<StatChargeback[]>();
    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column2<StatChargeback>[] = [
        { field: 'chargeback_id', header: 'Id' },
        {
            field: 'chargeback_reason',
            header: 'Reason',
            cell: (d) => ({
                value: startCase(getUnionKey(d.chargeback_reason.category)),
                description: d.chargeback_reason.code,
            }),
        },
        {
            field: 'chargeback_status',
            header: 'Status',
            cell: (d) => ({
                value: startCase(getUnionKey(d.chargeback_status)),
                color: (
                    {
                        pending: 'pending',
                        accepted: 'success',
                        rejected: 'warn',
                        cancelled: 'neutral',
                    } as const
                )[getUnionKey(d.chargeback_status)],
            }),
        },
        createCurrencyColumn((d) => ({ amount: d.amount, code: d.currency_code.symbolic_code }), {
            header: 'Amount',
        }),
        createCurrencyColumn(
            (d) => ({ amount: d.levy_amount, code: d.levy_currency_code.symbolic_code }),
            { header: 'Levy Amount' },
        ),
        createCurrencyColumn((d) => ({ amount: d.fee, code: d.currency_code.symbolic_code }), {
            header: 'Fee',
        }),
        createCurrencyColumn(
            (d) => ({ amount: d.provider_fee, code: d.currency_code.symbolic_code }),
            { header: 'Provider Fee' },
        ),
        createCurrencyColumn(
            (d) => ({ amount: d.external_fee, code: d.currency_code.symbolic_code }),
            { header: 'External Fee' },
        ),
        {
            field: 'stage',
            cell: (d) => ({ value: startCase(getUnionKey(d.stage)) }),
        },
        {
            field: 'invoice_id',
            header: {
                value: 'Invoice Id',
                description: 'Payment Id',
            },
            cell: (d) => ({
                description: d.payment_id,
                link: () => `/party/${d.party_id}/invoice/${d.invoice_id}/payment/${d.payment_id}`,
            }),
        },
        {
            field: 'created_at',
            cell: { type: 'datetime' },
        },
        createPartyColumn((d) => ({ id: d.party_id })),
        createShopColumn((d) => ({ shopId: d.shop_id, partyId: d.party_id })),
        // {
        //     field: 'external_id',
        //     hide: true,
        // },
        // {
        //     field: 'content.type',
        //     description: 'content.data',
        //     header: 'Content',
        //     hide: true,
        // },
        // createOperationColumn<StatChargeback>([
        //     {
        //         label: 'Change status',
        //         click: (data) => undefined,
        //     },
        // ]),
    ];

    constructor(private amountCurrencyService: AmountCurrencyService) {}
}
