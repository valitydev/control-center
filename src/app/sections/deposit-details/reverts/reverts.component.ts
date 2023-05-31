import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DepositStatus, StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { DialogService } from '@vality/ng-core';
import { filter } from 'rxjs/operators';

import { getDepositStatus } from '@cc/app/shared/utils';

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
    @Input()
    deposit: StatDeposit;

    reverts$ = this.fetchRevertsService.searchResult$;
    hasMore$ = this.fetchRevertsService.hasMore$;
    doAction$ = this.fetchRevertsService.doAction$;

    constructor(private fetchRevertsService: FetchRevertsService, private dialog: DialogService) {}

    ngOnInit() {
        this.fetchRevertsService.search({ depositID: this.deposit.id });
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
        return getDepositStatus(status) !== 'succeeded';
    }

    fetchMore() {
        this.fetchRevertsService.fetchMore();
    }
}
