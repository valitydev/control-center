import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormField, form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';

import {
    Column,
    NotifyLogService,
    TableResourceComponent,
    observableResource,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';

import { OrganizationFieldComponent } from '../organization-field/organization-field.component';

@Component({
    selector: 'cc-members',
    templateUrl: './members.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageLayoutModule, TableResourceComponent, FormField, OrganizationFieldComponent],
})
export class MembersComponent implements OnInit {
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

    members = observableResource({
        params: this.orgId$,
        loader: (orgId) =>
            !orgId
                ? of<domain.Member[]>([])
                : this.thriftOrgManagementService.ListMembers(orgId).pipe(
                      catchError((err) => {
                          this.log.error(err);
                          return of<domain.Member[]>([]);
                      }),
                  ),
    });

    columns: Column<domain.Member>[] = [
        {
            field: 'id',
            header: 'User ID',
            cell: (m) => ({ value: m.id }),
        },
        {
            field: 'email',
            cell: (m) => ({ value: m.email || '—' }),
        },
        {
            field: 'roles',
            cell: (m) => ({
                value: (m.roles || []).map((r) => r.role_id).join(', ') || '—',
            }),
        },
    ];

    ngOnInit(): void {
        const initialOrgId = this.route.snapshot.queryParams['orgId'];
        if (initialOrgId) {
            this.orgId.set(initialOrgId);
        }
    }
}
