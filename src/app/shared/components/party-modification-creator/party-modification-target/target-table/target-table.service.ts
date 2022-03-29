import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Modification } from '@vality/domain-proto/lib/claim_management';
import { Contract, Party, PartyContractor, Shop } from '@vality/domain-proto/lib/domain';
import { combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, tap, filter } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { progress } from '@cc/app/shared/custom-operators';

import { PartyTarget } from '../party-target';
import { modificationsToSelectableItems } from './modifications-to-selectable-items';
import { SelectableItem } from './selectable-item';

@Injectable()
export class TargetTableService {
    private getSelectableItems$ = new Subject<{
        partyID: string;
        targetName: PartyTarget;
        fromClaim: Modification[];
    }>();
    private hasError$ = new Subject<boolean | void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    selectableItems$: Observable<SelectableItem[]> = this.getSelectableItems$.pipe(
        tap(() => this.hasError$.next()),
        switchMap(({ partyID, targetName, fromClaim }) =>
            combineLatest([
                this.partyManagementWithUserService.getParty(partyID).pipe(
                    map((party) => {
                        const result = [];
                        const target = this.getTarget(party, targetName);
                        target.forEach((item, id) =>
                            result.push({ data: item, id, checked: false })
                        );
                        return result;
                    }),
                    catchError(() => {
                        this.snackBar.open('An error occured while fetching party', 'OK');
                        this.hasError$.next(true);
                        return of('error');
                    }),
                    filter((result) => result !== 'error')
                ),
                of(modificationsToSelectableItems(fromClaim, targetName)),
            ])
        ),
        map(([items, modsFromClaimItems]) => [...modsFromClaimItems, ...items])
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.getSelectableItems$, merge(this.selectableItems$, this.hasError$));

    constructor(
        private partyManagementWithUserService: PartyManagementWithUserService,
        private snackBar: MatSnackBar
    ) {}

    getSelectableItems(partyID: string, targetName: PartyTarget, fromClaim: Modification[]) {
        this.getSelectableItems$.next({ partyID, targetName, fromClaim });
    }

    private getTarget(
        party: Party,
        targetName: PartyTarget
    ): Map<string, Contract | Shop | PartyContractor> {
        switch (targetName) {
            case PartyTarget.Contract:
                return party.contracts;
            case PartyTarget.Shop:
                return party.shops;
            case PartyTarget.Contractor:
                return party.contractors;
        }
    }
}
