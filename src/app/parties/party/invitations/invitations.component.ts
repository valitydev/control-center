import isEqual from 'lodash-es/isEqual';
import { EMPTY, combineLatest, of } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    filter,
    map,
    shareReplay,
    switchMap,
} from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import {
    Column,
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    FiltersComponent,
    FiltersModule,
    NotifyLogService,
    Option,
    QueryParamsService,
    SelectFieldModule,
    TableResourceComponent,
    clean,
    countChanged,
    createMenuColumn,
    debounceTimeWithFirst,
    pagedObservableResource,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';

import { PartyStoreService } from '../party-store.service';

import { CreateInvitationDialogComponent } from './components/create-invitation-dialog';

export interface InvitationsFilters {
    status: domain.InvitationStatus | null;
}

const DEFAULT_FILTERS: InvitationsFilters = {
    status: null,
};

const INVITATION_STATUS_DETAILS: Record<
    domain.InvitationStatus,
    { label: string; color: 'success' | 'warn' | 'neutral' }
> = {
    [domain.InvitationStatus.pending]: { label: 'Pending', color: 'neutral' },
    [domain.InvitationStatus.accepted]: { label: 'Accepted', color: 'success' },
    [domain.InvitationStatus.expired]: { label: 'Expired', color: 'neutral' },
    [domain.InvitationStatus.revoked]: { label: 'Revoked', color: 'warn' },
};

@Component({
    selector: 'cc-invitations',
    templateUrl: './invitations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
        PageLayoutModule,
        TableResourceComponent,
        FiltersModule,
        SelectFieldModule,
        FormField,
    ],
})
export class InvitationsComponent {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private partyStoreService = inject(PartyStoreService);
    private qp = inject<QueryParamsService<Partial<InvitationsFilters>>>(QueryParamsService);
    private dialogService = inject(DialogService);

    organization = this.partyStoreService.organization;
    organizationNotFound = this.partyStoreService.organizationNotFound;

    filtersComponent = viewChild(FiltersComponent);

    statusOptions: Option<domain.InvitationStatus>[] = [
        { label: 'Pending', value: domain.InvitationStatus.pending },
        { label: 'Accepted', value: domain.InvitationStatus.accepted },
        { label: 'Expired', value: domain.InvitationStatus.expired },
        { label: 'Revoked', value: domain.InvitationStatus.revoked },
    ];

    filters = signal<InvitationsFilters>({
        status: this.qp.params.status ?? DEFAULT_FILTERS.status,
    });
    filtersControl = form(this.filters);

    active = computed(() => countChanged(this.filters(), DEFAULT_FILTERS));

    private filters$ = toObservable(this.filters).pipe(
        debounceTimeWithFirst(300),
        distinctUntilChanged(isEqual),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private params$ = combineLatest({
        orgId: toObservable(computed(() => this.organization.value()?.id)),
        filters: this.filters$,
    }).pipe(distinctUntilChanged(isEqual), shareReplay({ refCount: true, bufferSize: 1 }));

    invitations = pagedObservableResource<
        domain.Invitation,
        { orgId?: string; filters: InvitationsFilters }
    >({
        params: this.params$,
        loader: (params, options) =>
            !params?.orgId
                ? of({ result: [] })
                : this.thriftOrgManagementService
                      .ListInvitations(params.orgId, {
                          limit: options.size,
                          continuation_token: options.continuationToken,
                          status: params.filters.status ?? undefined,
                      })
                      .pipe(
                          map((res) => ({
                              result: res.invitations,
                              continuationToken: res.continuation_token,
                          })),
                          catchError((err) => {
                              this.log.error(err);
                              return of({ result: [] });
                          }),
                      ),
    });

    columns: Column<domain.Invitation>[] = [
        {
            field: 'id',
            cell: (inv) => ({ value: inv.id }),
        },
        {
            field: 'email',
            cell: (inv) => ({ value: inv.email }),
        },
        {
            field: 'status',
            cell: (inv) => {
                const mapped = INVITATION_STATUS_DETAILS[inv.status];
                return {
                    value: mapped?.label ?? String(inv.status),
                    color: mapped?.color,
                };
            },
        },
        {
            field: 'roles',
            cell: (inv) => ({
                value:
                    (inv.roles || [])
                        .map((r) => {
                            if (!r.scope) {
                                return r.role_id;
                            }
                            const scopeDesc = r.scope.resource_id
                                ? `${r.scope.scope_id}: ${r.scope.resource_id}`
                                : r.scope.scope_id;
                            return `${r.role_id} (${scopeDesc})`;
                        })
                        .join(', ') || '—',
            }),
        },
        {
            field: 'created_at',
            header: 'Created at',
            cell: (inv) => ({ value: inv.created_at, type: 'datetime' }),
        },
        {
            field: 'expires_at',
            header: 'Expires at',
            cell: (inv) => ({ value: inv.expires_at, type: 'datetime' }),
        },
        createMenuColumn((inv) => ({
            items: [
                {
                    label: 'Revoke',
                    disabled: inv.status !== domain.InvitationStatus.pending,
                    click: () => this.revoke(inv),
                },
            ],
        })),
    ];

    constructor() {
        this.filters$.pipe(takeUntilDestroyed()).subscribe((filters) => {
            void this.qp.set(clean(filters));
        });
    }

    create(): void {
        const org = this.organization.value();
        if (!org?.id) return;
        this.dialogService
            .open(CreateInvitationDialogComponent, {
                organizationId: org.id,
                partyId: org.party_id,
            })
            .afterClosed()
            .pipe(filter((res) => res?.status === DialogResponseStatus.Success))
            .subscribe(() => {
                this.invitations.reload();
            });
    }

    revoke(inv: domain.Invitation): void {
        const orgId = this.organization.value()?.id;
        if (!orgId) return;
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: `Revoke invitation for ${inv.email}`,
                hasReason: true,
                confirmLabel: 'Revoke',
            })
            .afterClosed()
            .pipe(
                filter((res) => res?.status === DialogResponseStatus.Success),
                switchMap((res) =>
                    this.thriftOrgManagementService
                        .RevokeInvitation(orgId, inv.id, {
                            reason: res.data?.reason || '',
                        })
                        .pipe(
                            catchError((err) => {
                                this.log.error(err);
                                return EMPTY;
                            }),
                        ),
                ),
            )
            .subscribe(() => {
                this.log.success('Invitation revoked');
                this.invitations.reload();
            });
    }

    createOrganization(): void {
        this.partyStoreService.createOrganization();
    }

    resetFilters(): void {
        this.filters.set(DEFAULT_FILTERS);
    }
}
