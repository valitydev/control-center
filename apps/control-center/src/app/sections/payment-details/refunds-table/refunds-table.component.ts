import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { InvoiceID, InvoicePaymentID, PartyID } from '@vality/domain-proto/domain';
import { Column, UpdateOptions } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

import { Refund } from '../../../api/fistful-stat';
import { createCurrencyColumn } from '../../../shared';

import { FetchRefundsService } from './services/fetch-refunds.service';

@Component({
    selector: 'cc-refunds-table',
    templateUrl: 'refunds-table.component.html',
    styleUrls: ['refunds-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FetchRefundsService],
    standalone: false
})
export class RefundsTableComponent implements OnInit {
    @Input() paymentID: InvoicePaymentID;
    @Input() invoiceID: InvoiceID;
    @Input() partyID: PartyID;

    isLoading$ = this.fetchRefundsService.isLoading$;
    hasMore$ = this.fetchRefundsService.hasMore$;
    refunds$ = this.fetchRefundsService.result$;

    columns: Column<Refund>[] = [
        { field: 'created_at', cell: { type: 'datetime' } },
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getUnionKey(d.status)),
                color: (
                    {
                        pending: 'pending',
                        succeeded: 'success',
                        failed: 'warn',
                    } as const
                )[getUnionKey(d.status)],
            }),
        },
        createCurrencyColumn((d) => ({ amount: d.amount, code: d.currency_symbolic_code }), {
            header: 'Amount',
        }),
        { field: 'reason' },
    ];

    constructor(private fetchRefundsService: FetchRefundsService) {}

    ngOnInit() {
        this.fetchRefundsService.load({
            common_search_query_params: { party_id: this.partyID },
            payment_id: this.paymentID,
            invoice_ids: [this.invoiceID],
        });
    }

    more() {
        this.fetchRefundsService.more();
    }

    reload(options: UpdateOptions) {
        this.fetchRefundsService.reload(options);
    }
}
