import { Component, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { PartyID } from '@vality/domain-proto/domain';
import { DialogService, LoadOptions, QueryParamsService, clean } from '@vality/ng-core';
import { debounceTime } from 'rxjs';
import { startWith, take } from 'rxjs/operators';

import { CLAIM_STATUSES } from '../../api/claim-management';
import { PartyStoreService } from '../party';

import { CreateClaimDialogComponent } from './components/create-claim-dialog/create-claim-dialog.component';
import { FetchClaimsService } from './fetch-claims.service';

@Component({
    templateUrl: './claims.component.html',
    providers: [PartyStoreService],
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
    party$ = this.partyStoreService.party$;

    private selectedPartyId: PartyID;

    constructor(
        private fetchClaimsService: FetchClaimsService,
        private dialogService: DialogService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<ClaimsComponent['filtersForm']['value']>,
        private destroyRef: DestroyRef,
        private partyStoreService: PartyStoreService,
    ) {}

    ngOnInit(): void {
        this.filtersForm.patchValue(this.qp.params);
        this.filtersForm.valueChanges
            .pipe(startWith(null), debounceTime(500), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.load();
            });
    }

    load(options?: LoadOptions): void {
        const filters = clean(this.filtersForm.value);
        void this.qp.set(filters);
        this.active = Object.keys(filters).length;
        this.partyStoreService.party$.pipe(take(1)).subscribe((p) => {
            this.fetchClaimsService.load(
                clean({
                    party_id: p ? p.id : undefined,
                    ...filters,
                    statuses: filters.statuses?.map((status) => ({ [status]: {} })) || [],
                }),
                options,
            );
        });
    }

    more(): void {
        this.fetchClaimsService.more();
    }

    create() {
        this.dialogService.open(CreateClaimDialogComponent, { partyId: this.selectedPartyId });
    }
}
