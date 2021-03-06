import { Injectable } from '@angular/core';
import { PartyID } from '@vality/domain-proto';
import {
    Modification,
    ModificationUnit,
    PartyModification,
} from '@vality/domain-proto/lib/claim_management';
import { BehaviorSubject, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { catchError, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { PartyModificationEmitter } from '@cc/app/shared/components';
import { progress } from '@cc/app/shared/custom-operators';

import { KeycloakTokenInfoService } from '../../../../keycloak-token-info.service';
import { ChangesetInfo, toChangesetInfos } from '../changeset-infos';
import { EditClaimChangesetService } from './edit-claim-changeset.service';
import { SaveClaimChangesetService } from './save-claim-changeset.service';

type PartyModificationPosition = number;

@Injectable()
export class UnsavedClaimChangesetService {
    private save$: Subject<{ partyID: PartyID; claimID: string }> = new Subject();
    private remove$: Subject<PartyModificationPosition> = new Subject();
    private edit$: Subject<PartyModificationPosition> = new Subject();
    private unsaved$ = new BehaviorSubject<Modification[]>([]);
    private hasError$ = new Subject<boolean | void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    changesetUpdated$ = new Subject<void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    unsavedChangesetInfos$: Observable<ChangesetInfo[]> = this.unsaved$.pipe(
        map((mods) => {
            const { name } = this.keycloakTokenInfoService.decodedUserToken;
            return toChangesetInfos(
                mods.map(
                    (mod) =>
                        ({
                            modification: mod,
                            user_info: { username: name },
                        } as ModificationUnit)
                )
            );
        }),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.save$, merge(this.changesetUpdated$, this.hasError$));

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        private saveClaimChangesetService: SaveClaimChangesetService,
        private editClaimChangesetService: EditClaimChangesetService,
        private partyModificationEmitter: PartyModificationEmitter
    ) {
        this.unsavedChangesetInfos$.subscribe();

        this.remove$
            .pipe(
                switchMap((pos) => forkJoin([of(pos), this.unsaved$.pipe(first())])),
                map(([pos, modifications]) => modifications.filter((_, i) => pos !== i))
            )
            .subscribe((modifications) => this.unsaved$.next(modifications));

        this.save$
            .pipe(
                tap(() => this.hasError$.next()),
                switchMap(({ partyID, claimID }) =>
                    this.saveClaimChangesetService
                        .save(partyID, claimID, this.unsaved$.getValue())
                        .pipe(
                            catchError(() => {
                                this.hasError$.next(true);
                                return of();
                            })
                        )
                )
            )
            .subscribe(() => {
                this.unsaved$.next([]);
                this.changesetUpdated$.next();
            });

        this.edit$
            .pipe(
                switchMap((pos) =>
                    this.editClaimChangesetService.edit(pos, this.unsaved$.getValue())
                )
            )
            .subscribe((mods) => {
                this.unsaved$.next(mods);
            });

        this.partyModificationEmitter.modification$.subscribe(
            (partyModification: PartyModification) =>
                this.addModification({ party_modification: partyModification })
        );
    }

    save(partyID: PartyID, claimID: string) {
        this.save$.next({ partyID, claimID });
    }

    edit(pos: number) {
        this.edit$.next(pos);
    }

    addModification(mod: Modification) {
        this.unsaved$.next([...this.unsaved$.getValue(), mod]);
    }

    remove(pos: PartyModificationPosition) {
        this.remove$.next(pos);
    }
}
