import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { PartyID } from '@vality/domain-proto/domain';
import { DialogService, LoadOptions, QueryParamsService, clean } from '@vality/ng-core';
import { debounceTime } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { CLAIM_STATUSES } from '../../api/claim-management';

import { CreateClaimDialogComponent } from './components/create-claim-dialog/create-claim-dialog.component';
import { FetchClaimsService } from './fetch-claims.service';

@UntilDestroy()
@Component({
    templateUrl: './claims.component.html',
})
export class ClaimsComponent implements OnInit {
    isLoading$ = this.fetchClaimsService.isLoading$;
    claims$ = this.fetchClaimsService.result$;
    hasMore$ = this.fetchClaimsService.hasMore$;
    claimStatuses = CLAIM_STATUSES;
    filtersForm = this.fb.group({
        party_id: undefined as string,
        claim_id: undefined as number,
        statuses: [[] as string[]],
    });
    active = 0;

    private selectedPartyId: PartyID;

    constructor(
        private fetchClaimsService: FetchClaimsService,
        private dialogService: DialogService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<ClaimsComponent['filtersForm']['value']>,
    ) {}

    ngOnInit(): void {
        this.filtersForm.patchValue(this.qp.params);
        this.filtersForm.valueChanges
            .pipe(startWith(null), debounceTime(500), untilDestroyed(this))
            .subscribe(() => {
                this.load();
            });
    }

    load(options?: LoadOptions): void {
        const filters = clean(this.filtersForm.value);
        void this.qp.set(filters);
        this.fetchClaimsService.load(
            { ...filters, statuses: filters.statuses?.map((status) => ({ [status]: {} })) || [] },
            options,
        );
        this.active = Object.keys(filters).length;
    }

    more(): void {
        this.fetchClaimsService.more();
    }

    create() {
        this.dialogService.open(CreateClaimDialogComponent, { partyId: this.selectedPartyId });
    }
}
