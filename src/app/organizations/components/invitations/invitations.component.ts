import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormField, form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';

import {
    Column,
    NotifyLogService,
    TableResourceComponent,
    pagedObservableResource,
} from '@vality/matez';
import { ListInvitationsRequest, domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';

import { OrganizationFieldComponent } from '../organization-field/organization-field.component';

@Component({
    selector: 'cc-invitations',
    templateUrl: './invitations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageLayoutModule, TableResourceComponent, FormField, OrganizationFieldComponent],
})
export class InvitationsComponent implements OnInit {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    orgId = signal<string>('');
    control = form(this.orgId, (schemaPath) => {
        required(schemaPath);
    });

    private orgId$ = toObservable(this.orgId).pipe(
        tap((orgId) => {
            void this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { orgId: orgId || null },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        }),
    );

    invitations = pagedObservableResource<
        domain.Invitation,
        { orgId: string } & Omit<ListInvitationsRequest, 'limit' | 'continuation_token'>
    >({
        params: this.orgId$.pipe(map((orgId) => ({ orgId }))),
        loader: ({ orgId, ...params }, options) =>
            !orgId
                ? of({ result: [] })
                : this.thriftOrgManagementService
                      .ListInvitations(orgId, {
                          limit: options.size,
                          continuation_token: options.continuationToken,
                          ...params,
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
                const statusMap: Record<
                    number,
                    { label: string; color: 'success' | 'warn' | 'neutral' }
                > = {
                    1: { label: 'Pending', color: 'neutral' },
                    2: { label: 'Accepted', color: 'success' },
                    3: { label: 'Expired', color: 'neutral' },
                    4: { label: 'Revoked', color: 'warn' },
                };
                const mapped = statusMap[inv.status];
                return {
                    value: mapped?.label ?? String(inv.status),
                    color: mapped?.color,
                };
            },
        },
        {
            field: 'roles',
            cell: (inv) => ({
                value: (inv.roles || []).map((r) => r.role_id).join(', ') || '—',
            }),
        },
        {
            field: 'created_at',
            header: 'Created at',
            cell: (inv) => ({ value: inv.created_at }),
        },
        {
            field: 'expires_at',
            header: 'Expires at',
            cell: (inv) => ({ value: inv.expires_at }),
        },
    ];

    ngOnInit(): void {
        const initialOrgId = this.route.snapshot.queryParams['orgId'];
        if (initialOrgId) {
            this.orgId.set(initialOrgId);
        }
    }
}
