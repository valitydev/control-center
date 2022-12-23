import { Injectable } from '@angular/core';
import {
    claim_management_ClaimManagementCodegenClient,
    ThriftAstMetadata,
    claim_management_ClaimManagement,
} from '@vality/domain-proto';
import {
    Claim,
    ModificationChangeset,
    ClaimID,
    ClaimSearchQuery,
    ClaimSearchResponse,
    ClaimRevision,
    ModificationID,
    ModificationChange,
} from '@vality/domain-proto/claim_management';
import { PartyID } from '@vality/domain-proto/domain';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class ClaimManagementService {
    private client$: Observable<claim_management_ClaimManagementCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('ClaimManagement'))
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                claim_management_ClaimManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateClaim(partyId: PartyID, changeset: ModificationChangeset): Observable<Claim> {
        return this.client$.pipe(switchMap((c) => c.CreateClaim(partyId, changeset)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetClaim(partyId: PartyID, id: ClaimID): Observable<Claim> {
        return this.client$.pipe(switchMap((c) => c.GetClaim(partyId, id)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchClaims(claimRequest: ClaimSearchQuery): Observable<ClaimSearchResponse> {
        return this.client$.pipe(switchMap((c) => c.SearchClaims(claimRequest)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    AcceptClaim(partyId: PartyID, id: ClaimID, revision: ClaimRevision): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.AcceptClaim(partyId, id, revision)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    UpdateClaim(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        changeset: ModificationChangeset
    ): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.UpdateClaim(partyId, id, revision, changeset)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    UpdateModification(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        modificationId: ModificationID,
        modificationChange: ModificationChange
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) =>
                c.UpdateModification(partyId, id, revision, modificationId, modificationChange)
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RemoveModification(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        modificationId: ModificationID
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) => c.RemoveModification(partyId, id, revision, modificationId))
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RequestClaimReview(partyId: PartyID, id: ClaimID, revision: ClaimRevision): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RequestClaimReview(partyId, id, revision)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RequestClaimChanges(partyId: PartyID, id: ClaimID, revision: ClaimRevision): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RequestClaimChanges(partyId, id, revision)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    DenyClaim(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        reason: string
    ): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.DenyClaim(partyId, id, revision, reason)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RevokeClaim(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        reason: string
    ): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RevokeClaim(partyId, id, revision, reason)));
    }
}
