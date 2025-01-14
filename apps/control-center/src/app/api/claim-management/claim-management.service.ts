import { Injectable } from '@angular/core';
import {
    ThriftAstMetadata,
    claim_management_ClaimManagement,
    claim_management_ClaimManagementCodegenClient,
} from '@vality/domain-proto';
import {
    Claim,
    ClaimID,
    ClaimRevision,
    ClaimSearchQuery,
    ClaimSearchResponse,
    ModificationChange,
    ModificationChangeset,
    ModificationID,
} from '@vality/domain-proto/claim_management';
import { PartyID } from '@vality/domain-proto/domain';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class ClaimManagementService {
    private client$: Observable<claim_management_ClaimManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('ClaimManagement')),
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                claim_management_ClaimManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    CreateClaim(partyId: PartyID, changeset: ModificationChangeset): Observable<Claim> {
        return this.client$.pipe(switchMap((c) => c.CreateClaim(partyId, changeset)));
    }

    GetClaim(partyId: PartyID, id: ClaimID): Observable<Claim> {
        return this.client$.pipe(switchMap((c) => c.GetClaim(partyId, id)));
    }

    SearchClaims(claimRequest: ClaimSearchQuery): Observable<ClaimSearchResponse> {
        return this.client$.pipe(switchMap((c) => c.SearchClaims(claimRequest)));
    }

    AcceptClaim(partyId: PartyID, id: ClaimID, revision: ClaimRevision): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.AcceptClaim(partyId, id, revision)));
    }

    UpdateClaim(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        changeset: ModificationChangeset,
    ): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.UpdateClaim(partyId, id, revision, changeset)));
    }

    UpdateModification(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        modificationId: ModificationID,
        modificationChange: ModificationChange,
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) =>
                c.UpdateModification(partyId, id, revision, modificationId, modificationChange),
            ),
        );
    }

    RemoveModification(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        modificationId: ModificationID,
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) => c.RemoveModification(partyId, id, revision, modificationId)),
        );
    }

    RequestClaimReview(partyId: PartyID, id: ClaimID, revision: ClaimRevision): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RequestClaimReview(partyId, id, revision)));
    }

    RequestClaimChanges(partyId: PartyID, id: ClaimID, revision: ClaimRevision): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RequestClaimChanges(partyId, id, revision)));
    }

    DenyClaim(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        reason: string,
    ): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.DenyClaim(partyId, id, revision, reason)));
    }

    RevokeClaim(
        partyId: PartyID,
        id: ClaimID,
        revision: ClaimRevision,
        reason: string,
    ): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RevokeClaim(partyId, id, revision, reason)));
    }
}
