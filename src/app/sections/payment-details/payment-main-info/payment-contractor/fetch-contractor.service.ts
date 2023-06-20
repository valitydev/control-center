import { Injectable } from '@angular/core';
import { ContractID, PartyID, Party } from '@vality/domain-proto/domain';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { progress } from '@cc/app/shared/custom-operators';

@Injectable()
export class FetchContractorService {
    private getContractor$ = new Subject<{ partyID: PartyID; contractID: ContractID }>();
    private hasError$ = new Subject<void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    contractor$ = this.getContractor$.pipe(
        switchMap(({ partyID, contractID }) =>
            forkJoin([
                of(contractID),
                this.partyManagementService.Get(partyID).pipe(
                    catchError(() => {
                        this.hasError$.next();
                        return of('error');
                    }),
                    filter((result) => result !== 'error')
                ),
            ])
        ),
        map(([contractID, party]: [ContractID, Party]) => {
            const contractorID = party.contracts.get(contractID)?.contractor_id;
            return party.contractors.get(contractorID)?.contractor;
        }),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.getContractor$, merge(this.contractor$, this.hasError$)).pipe(
        startWith(true)
    );

    constructor(private partyManagementService: PartyManagementService) {
        this.contractor$.subscribe();
    }

    getContractor(params: { partyID: PartyID; contractID: ContractID }) {
        this.getContractor$.next(params);
    }
}
