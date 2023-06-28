import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { StatChargeback } from '@vality/magista-proto/magista';
import { LoadOptions, Column, createOperationColumn } from '@vality/ng-core';

import { PartiesStoreService } from '../../../../api/payment-processing';
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
        { field: 'chargeback_id', pinned: 'left' },
        createOperationColumn([
            {
                label: 'Details',
                click: (data) => void this.router.navigate(['chargeback', data.chargeback_id]),
            },
        ]),
    ];

    constructor(
        private amountCurrencyService: AmountCurrencyService,
        private partiesStoreService: PartiesStoreService,
        private router: Router
    ) {}
}
