import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PartyID } from '@vality/domain-proto';
import { Modification } from '@vality/domain-proto/lib/claim_management';
import Int64 from '@vality/thrift-ts/lib/int64';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ClaimManagementService } from '../../../../thrift-services/damsel/claim-management.service';

@Injectable()
export class SaveClaimChangesetService {
    constructor(
        private claimManagementService: ClaimManagementService,
        private snackBar: MatSnackBar
    ) {}

    save(partyID: PartyID, claimID: string, mods: Modification[]) {
        return new Observable((observer) => {
            if (mods.length === 0) {
                observer.error('error');
            }
            this.claimManagementService
                .updateClaim(partyID, new Int64(parseInt(claimID, 10)) as unknown as number, mods)
                .pipe(catchError(() => this.handleError()))
                .subscribe((e) => {
                    if (e) {
                        observer.error('error');
                    }
                    observer.next();
                    observer.complete();
                });
        });
    }

    private handleError() {
        this.snackBar.open('An error occurred while saving new modification', 'OK');
        return of('error');
    }
}
