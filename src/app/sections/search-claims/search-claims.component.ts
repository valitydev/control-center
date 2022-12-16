import { Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { PartyID } from '@vality/domain-proto/domain';
import { BaseDialogService, cleanPrimitiveProps, clean } from '@vality/ng-core';

import { ClaimSearchForm } from '@cc/app/shared/components';

import { CreateClaimDialogComponent } from './components/create-claim-dialog/create-claim-dialog.component';
import { SearchClaimsService } from './search-claims.service';

@Component({
    templateUrl: './search-claims.component.html',
    styleUrls: ['./search-claims.component.scss'],
})
export class SearchClaimsComponent implements OnInit {
    doAction$ = this.searchClaimService.doAction$;
    claims$ = this.searchClaimService.searchResult$;
    hasMore$ = this.searchClaimService.hasMore$;
    private selectedPartyId: PartyID;

    constructor(
        private searchClaimService: SearchClaimsService,
        private snackBar: MatSnackBar,
        private baseDialogService: BaseDialogService
    ) {}

    ngOnInit(): void {
        this.searchClaimService.errors$.subscribe((e) =>
            this.snackBar.open(`An error occurred while search claims (${String(e)})`, 'OK')
        );
    }

    search(v: ClaimSearchForm): void {
        this.selectedPartyId = v?.party_id;
        this.searchClaimService.search(
            cleanPrimitiveProps({ ...v, statuses: clean(v.statuses?.map((s) => ({ [s]: {} }))) })
        );
    }

    fetchMore(): void {
        this.searchClaimService.fetchMore();
    }

    create() {
        this.baseDialogService.open(CreateClaimDialogComponent, { partyId: this.selectedPartyId });
    }
}
