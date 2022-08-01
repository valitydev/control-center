import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { filter } from 'rxjs/operators';

import { ClaimSearchForm } from '@cc/app/shared/components';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';

import { CreateClaimService } from './create-claim.service';
import { PartyClaimsService } from './party-claims.service';

@Component({
    templateUrl: 'party-claims.component.html',
    providers: [PartyClaimsService, CreateClaimService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyClaimsComponent implements OnInit {
    doAction$ = this.partyClaimsService.doAction$;
    claims$ = this.partyClaimsService.searchResult$;
    hasMore$ = this.partyClaimsService.hasMore$;

    constructor(
        private partyClaimsService: PartyClaimsService,
        private snackBar: MatSnackBar,
        private createClaimService: CreateClaimService,
        private baseDialogService: BaseDialogService
    ) {}

    ngOnInit() {
        this.partyClaimsService.errors$.subscribe((e) =>
            this.snackBar.open(`An error occurred while search claim (${String(e)})`, 'OK')
        );
    }

    fetchMore() {
        this.partyClaimsService.fetchMore();
    }

    search({ claim_id, statuses }: ClaimSearchForm) {
        this.partyClaimsService.search({ claim_id, statuses });
    }

    createClaim() {
        this.baseDialogService
            .open(ConfirmActionDialogComponent)
            .afterClosed()
            .pipe(filter(({ status }) => status === BaseDialogResponseStatus.Success))
            .subscribe(() => {
                this.createClaimService.createClaim();
            });
    }
}
