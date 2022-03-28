import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PartyID } from '@vality/domain-proto';
import Int64 from '@vality/thrift-ts/lib/int64';
import { of, ReplaySubject } from 'rxjs';
import { catchError, filter, shareReplay, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { ClaimManagementService } from '../../thrift-services/damsel/claim-management.service';

@Injectable()
export class FetchClaimService {
    private getClaim$: ReplaySubject<{ partyID: PartyID; claimID: string }> = new ReplaySubject();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    claim$ = this.getClaim$.pipe(
        switchMap(({ partyID, claimID }) =>
            this.claimManagementService
                .getClaim(partyID, (new Int64(parseInt(claimID, 10)) as unknown) as number)
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this.snackBar.open('An error occurred while fetching claim', 'OK');
                        return of('error');
                    })
                )
        ),
        filter((result) => result !== 'error'),
        shareReplay(1)
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(this.getClaim$, this.claim$);

    constructor(
        private claimManagementService: ClaimManagementService,
        private snackBar: MatSnackBar
    ) {
        this.getClaim$.subscribe();
    }

    getClaim(partyID: PartyID, claimID: string) {
        this.getClaim$.next({ partyID, claimID });
    }
}
