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

import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DialogService, NotifyLogService, observableResource } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { PartiesStoreService } from '~/api/payment-processing';
import { ThriftOrganizationManagementService } from '~/api/services';

import { CreateOrganizationDialogComponent } from '../../organizations';

import { isOrganizationNotFoundError } from './utils';

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

    organizationNotFound = signal<boolean>(false);

    organization = observableResource<domain.Organization, string>({
        params: this.id$,
        loader: (partyId) => {
            this.organizationNotFound.set(false);
            if (!partyId) {
                return of(null);
            }
            return this.thriftOrgManagementService.GetOrganizationByParty(partyId).pipe(
                catchError((err) => {
                    if (isOrganizationNotFoundError(err)) {
                        this.organizationNotFound.set(true);
                    } else {
                        this.log.error(err);
                    }
                    return of(null);
                }),
            );
        },
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
