import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DepositStatus, StatDeposit, StatDepositRevert } from '@vality/fistful-proto/fistful_stat';
import { DialogService, UpdateOptions, Column2 } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs/operators';

import { createCurrencyColumn } from '@cc/app/shared/utils/table2';

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

    reverts$ = this.fetchRevertsService.result$;
    hasMore$ = this.fetchRevertsService.hasMore$;
    isLoading$ = this.fetchRevertsService.isLoading$;
    columns: Column2<StatDepositRevert>[] = [
        { field: 'id' },
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
        createCurrencyColumn(
            (d) => ({
                amount: d.body.amount,
                code: d.body.currency.symbolic_code,
            }),
            { header: 'Amount' },
        ),
        { field: 'created_at', cell: { type: 'datetime' } },
    ];

    constructor(
        private fetchRevertsService: FetchRevertsService,
        private dialog: DialogService,
    ) {}

    ngOnInit() {
        this.fetchRevertsService.load({ deposit_id: this.deposit.id });
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
                this.fetchRevertsService.reload();
            });
    }

    isCreateRevertAvailable(status: DepositStatus): boolean {
        return getUnionKey(status) !== 'succeeded';
    }

    reload(options: UpdateOptions) {
        this.fetchRevertsService.reload(options);
    }

    more() {
        this.fetchRevertsService.more();
    }
}
