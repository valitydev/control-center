import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { DepositStatus, StatDeposit, StatDepositRevert } from '@vality/fistful-proto/fistful_stat';
import { Column, DialogService, UpdateOptions } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs/operators';

import { createCurrencyColumn } from '../../../shared';

import { CreateRevertDialogComponent } from './create-revert-dialog/create-revert-dialog.component';
import { FetchRevertsService } from './services/fetch-reverts/fetch-reverts.service';

@Component({
    selector: 'cc-reverts',
    templateUrl: 'reverts.component.html',
    styleUrls: ['reverts.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FetchRevertsService],
    standalone: false,
})
export class RevertsComponent implements OnInit {
    private fetchRevertsService = inject(FetchRevertsService);
    private dialog = inject(DialogService);
    @Input() deposit: StatDeposit;

    reverts$ = this.fetchRevertsService.result$;
    hasMore$ = this.fetchRevertsService.hasMore$;
    isLoading$ = this.fetchRevertsService.isLoading$;
    columns: Column<StatDepositRevert>[] = [
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
