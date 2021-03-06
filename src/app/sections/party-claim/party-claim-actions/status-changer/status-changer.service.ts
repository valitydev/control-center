import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PartyID } from '@vality/domain-proto';
import { ClaimStatus, PartyModification } from '@vality/domain-proto/lib/claim_management';
import { Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { StatusChangerDialogComponent } from './status-changer-dialog.component';

@Injectable()
export class StatusChangerService {
    private destroy$: Subject<void> = new Subject();
    private changeStatus$: Subject<{
        partyID: PartyID;
        claimID: string;
        claimStatus: ClaimStatus;
    }> = new Subject();
    private changed$: Subject<PartyModification[]> = new Subject();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    statusChanged$: Observable<PartyModification[]> = this.changed$.asObservable();

    constructor(private dialog: MatDialog) {}

    init() {
        this.changeStatus$
            .pipe(
                takeUntil(this.destroy$),
                switchMap(({ partyID, claimID, claimStatus }) =>
                    this.dialog
                        .open(StatusChangerDialogComponent, {
                            width: '500px',
                            disableClose: true,
                            data: {
                                partyID,
                                claimID,
                                claimStatus,
                            },
                        })
                        .afterClosed()
                        .pipe(filter((r) => r))
                )
            )
            .subscribe((r) => this.changed$.next(r));
    }

    changeStatus(partyID: PartyID, claimID: string, claimStatus: ClaimStatus) {
        this.changeStatus$.next({ partyID, claimID, claimStatus });
    }

    destroy() {
        this.destroy$.next();
    }
}
