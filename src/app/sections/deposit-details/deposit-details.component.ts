import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { pluck, take } from 'rxjs/operators';

import { ReceiveDepositService } from './services/receive-deposit/receive-deposit.service';

@UntilDestroy()
@Component({
    templateUrl: 'deposit-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ReceiveDepositService],
})
export class DepositDetailsComponent implements OnInit {
    deposit$ = this.fetchDepositService.deposit$;

    constructor(
        private fetchDepositService: ReceiveDepositService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.route.params
            .pipe(take(1), pluck('depositID'))
            .subscribe((depositID) => this.fetchDepositService.receiveDeposit(depositID));
    }
}
