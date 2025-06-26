import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { PartyID } from '@vality/domain-proto/domain';
import {
    DialogService,
    LoadOptions,
    QueryParamsService,
    clean,
    countChanged,
    debounceTimeWithFirst,
    getValueChanges,
} from '@vality/matez';
import { map, shareReplay, take } from 'rxjs/operators';

import { CLAIM_STATUSES } from '../../api/claim-management';
import { DEBOUNCE_TIME_MS } from '../../tokens';
import { PartyStoreService } from '../party';

import { CreateClaimDialogComponent } from './components/create-claim-dialog/create-claim-dialog.component';
import { FetchClaimsService } from './fetch-claims.service';

@Component({
    templateUrl: './claims.component.html',
    providers: [PartyStoreService],
    standalone: false,
})
export class ClaimsComponent implements OnInit {
    private fetchClaimsService = inject(FetchClaimsService);
    private dialogService = inject(DialogService);
    private fb = inject(NonNullableFormBuilder);
    private qp = inject<QueryParamsService<ClaimsComponent['filtersForm']['value']>>(
        QueryParamsService<ClaimsComponent['filtersForm']['value']>,
    );
    private destroyRef = inject(DestroyRef);
    private partyStoreService = inject(PartyStoreService);
    private debounceTimeMs = inject<number>(DEBOUNCE_TIME_MS);
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
