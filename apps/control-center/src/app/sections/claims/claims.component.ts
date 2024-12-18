import { Component, OnInit, DestroyRef, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { PartyID } from '@vality/domain-proto/domain';
import {
    DialogService,
    LoadOptions,
    QueryParamsService,
    clean,
    getValueChanges,
    countChanged,
    debounceTimeWithFirst,
} from '@vality/ng-core';
import { take, map, shareReplay } from 'rxjs/operators';

import { CLAIM_STATUSES } from '../../api/claim-management';
import { DEBOUNCE_TIME_MS } from '../../tokens';
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
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFilters, v)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    party$ = this.partyStoreService.party$;

    private selectedPartyId: PartyID;
    private initFilters = this.filtersForm.value;

    constructor(
        private fetchClaimsService: FetchClaimsService,
        private dialogService: DialogService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<ClaimsComponent['filtersForm']['value']>,
        private destroyRef: DestroyRef,
        private partyStoreService: PartyStoreService,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
    ) {}

    ngOnInit(): void {
        this.filtersForm.patchValue(this.qp.params);
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const filters = clean(this.filtersForm.value);
                void this.qp.set(filters);
                this.load(filters);
            });
    }

    load(filters: ClaimsComponent['filtersForm']['value'], options?: LoadOptions): void {
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

    reload(options?: LoadOptions) {
        this.fetchClaimsService.reload(options);
    }

    more(): void {
        this.fetchClaimsService.more();
    }

    create() {
        this.dialogService.open(CreateClaimDialogComponent, { partyId: this.selectedPartyId });
    }
}
