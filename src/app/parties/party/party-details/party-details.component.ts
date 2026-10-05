import { from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, observableResource } from '@vality/matez';
import { ThriftViewerModule } from '@vality/ng-thrift';
import { loadThriftMetadata } from '@vality/org-management-proto/admin_management';
import { Organization, OrganizationStatus } from '@vality/org-management-proto/domain';

import { DomainService } from '~/api/domain-config';
import { PageLayoutModule } from '~/components/page-layout';
import { DomainThriftViewerComponent } from '~/components/thrift-api-crud';

import { OrganizationActionsService } from '../../../organizations';
import { PartyStoreService } from '../party-store.service';

@Component({
    selector: 'cc-party-details',
    templateUrl: './party-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        PageLayoutModule,
        DomainThriftViewerComponent,
        ThriftViewerModule,
    ],
})
export class PartyDetailsComponent {
    private partyStoreService = inject(PartyStoreService);
    private domainService = inject(DomainService);
    private log = inject(NotifyLogService);
    private organizationActions = inject(OrganizationActionsService);

    orgStatus = OrganizationStatus;
    orgMetadata$ = from(loadThriftMetadata());

    party = observableResource<VersionedObject, string>({
        params: this.partyStoreService.id$,
        loader: (partyId) =>
            partyId
                ? this.domainService.get({ party_config: { id: partyId } }).pipe(
                      catchError((err) => {
                          this.log.error(err);
                          return of(null);
                      }),
                  )
                : of(null),
    });

    organization = this.partyStoreService.organization;
    organizationNotFound = this.partyStoreService.organizationNotFound;

    createOrganization(): void {
        this.partyStoreService.createOrganization();
    }

    modifyOrganization(org: Organization): void {
        this.organizationActions.modify(org).subscribe(() => {
            this.organization.reload();
        });
    }

    deactivateOrganization(org: Organization): void {
        this.organizationActions.deactivate(org).subscribe(() => {
            this.organization.reload();
        });
    }

    activateOrganization(org: Organization): void {
        this.organizationActions.activate(org).subscribe(() => {
            this.organization.reload();
        });
    }
}
