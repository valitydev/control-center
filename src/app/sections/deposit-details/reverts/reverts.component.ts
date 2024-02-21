import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DepositStatus, StatDeposit, StatDepositRevert } from '@vality/fistful-proto/fistful_stat';
import { DialogService, Column } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs/operators';

import { createCurrencyColumn } from '@cc/app/shared/utils';

import { getUnionKey } from '../../../../utils';

import { CreateRevertDialogComponent } from './create-revert-dialog/create-revert-dialog.component';
import { FetchRevertsService } from './services/fetch-reverts/fetch-reverts.service';

@Component({
    selector: 'cc-reverts',
    templateUrl: 'reverts.component.html',
    styleUrls: ['reverts.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FetchRevertsService],
})
export class RevertsComponent implements OnInit {
    @Input() deposit: StatDeposit;

    reverts$ = this.fetchRevertsService.searchResult$;
    hasMore$ = this.fetchRevertsService.hasMore$;
    doAction$ = this.fetchRevertsService.doAction$;
    columns: Column<StatDepositRevert>[] = [
        { field: 'id' },
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
            (d) => d.body.amount,
            (d) => d.body.currency.symbolic_code,
        ),
        { field: 'created_at', type: 'datetime' },
    ];

    constructor(
        private fetchRevertsService: FetchRevertsService,
        private dialog: DialogService,
    ) {}

    ngOnInit() {
        this.fetchRevertsService.search({ deposit_id: this.deposit.id });
    }

    createRevert() {
        this.dialog
            .open(CreateRevertDialogComponent, {
                depositID: this.deposit.id,
                currency: this.deposit.currency_symbolic_code,
            })
            .afterClosed()
            .pipe(filter((res) => res?.status === 'success'))
            .subscribe(() => {
                this.fetchRevertsService.refresh();
            });
    }

    isCreateRevertAvailable(status: DepositStatus): boolean {
        return getUnionKey(status) !== 'succeeded';
    }

    update() {
        this.fetchRevertsService.refresh();
    }

    fetchMore() {
        this.fetchRevertsService.fetchMore();
    }
}
