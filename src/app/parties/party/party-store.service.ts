import { EMPTY, of } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    first,
    map,
    shareReplay,
    startWith,
    switchMap,
} from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DialogService, NotifyLogService, observableResource } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { PartiesStoreService } from '~/api/payment-processing';
import { ThriftOrganizationManagementService } from '~/api/services';

import { CreateOrganizationDialogComponent } from '../../organizations';

@Injectable()
export class PartyStoreService {
    private route = inject(ActivatedRoute);
    private partiesStoreService = inject(PartiesStoreService);
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private dialogService = inject(DialogService);

    id$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map(({ partyID }) => partyID as string),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    party$ = this.id$.pipe(
        switchMap((partyID) =>
            partyID
                ? this.partiesStoreService.getParty(partyID).value$.pipe(
                      catchError((err) => {
                          this.log.error(err);
                          return EMPTY;
                      }),
                  )
                : of(null),
        ),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    organization = observableResource<domain.Organization, string>({
        params: this.id$,
        loader: (partyId) =>
            partyId
                ? this.thriftOrgManagementService.GetOrganizationByParty(partyId).pipe(
                      catchError(() => {
                          return of(null);
                      }),
                  )
                : of(null),
    });

    createOrganization(): void {
        this.id$
            .pipe(
                first(),
                switchMap((partyId) =>
                    this.dialogService
                        .open(CreateOrganizationDialogComponent, { partyId })
                        .afterClosed(),
                ),
            )
            .subscribe((result) => {
                if (result?.status === 'success') {
                    this.organization.reload();
                }
            });
    }
}
