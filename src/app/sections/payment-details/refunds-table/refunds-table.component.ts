import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { InvoicePaymentID, InvoiceID, PartyID } from '@vality/domain-proto/domain';
import { Column, UpdateOptions } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';

import { getUnionKey } from '../../../../utils';
import { Refund } from '../../../api/fistful-stat';
import { createCurrencyColumn } from '../../../shared';

import { FetchRefundsService } from './services/fetch-refunds.service';

@Component({
    selector: 'cc-refunds-table',
    templateUrl: 'refunds-table.component.html',
    styleUrls: ['refunds-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FetchRefundsService],
})
export class RefundsTableComponent implements OnInit {
    @Input() paymentID: InvoicePaymentID;
    @Input() invoiceID: InvoiceID;
    @Input() partyID: PartyID;

    isLoading$ = this.fetchRefundsService.isLoading$;
    hasMore$ = this.fetchRefundsService.hasMore$;
    refunds$ = this.fetchRefundsService.result$;

    columns: Column<Refund>[] = [
        { field: 'created_at', type: 'datetime' },
        {
            field: 'status',
            type: 'tag',
            formatter: (d) => getUnionKey(d.status),
            typeParameters: {
                label: (d) => startCase(getUnionKey(d.status)),
                tags: {
                    pending: { color: 'pending' },
                    succeeded: { color: 'success' },
                    failed: { color: 'warn' },
                },
            },
        },
        createCurrencyColumn(
            'amount',
            (d) => d.amount,
            (d) => d.currency_symbolic_code,
        ),
        'reason',
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
