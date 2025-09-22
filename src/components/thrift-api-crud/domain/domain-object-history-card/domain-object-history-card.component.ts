import { first, map } from 'rxjs';

import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { Reference } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import { DialogResponseStatus, createMenuColumn, pagedObservableResource } from '@vality/matez';
import { ThriftPipesModule, getUnionValue } from '@vality/ng-thrift';

import { DomainService } from '~/api/domain-config';

import { DomainObjectsTableComponent } from '../../../../app/domain-config/domain-objects-table';
import { SidenavInfoModule, SidenavInfoService } from '../../../sidenav-info';
import { CardComponent } from '../../../sidenav-info/components/card/card.component';
import { DomainObjectService } from '../services/domain-object.service';

@Component({
    selector: 'cc-domain-object-history-card',
    imports: [
        CardComponent,
        SidenavInfoModule,
        MatButtonModule,
        ThriftPipesModule,
        DomainObjectsTableComponent,
    ],
    templateUrl: './domain-object-history-card.component.html',
})
export class DomainObjectHistoryCardComponent {
    private domainService = inject(DomainService);
    private domainObjectService = inject(DomainObjectService);
    private sidenavInfoService = inject(SidenavInfoService);

    ref = input<Reference>();

    resource = pagedObservableResource<LimitedVersionedObject, Reference>({
        params: this.ref,
        loader: (ref, { size, continuationToken }) =>
            this.domainService
                .getHistory(ref, {
                    limit: size,
                    continuation_token: continuationToken,
                })
                .pipe(
                    map(({ result, continuation_token }) => ({
                        result,
                        continuationToken: continuation_token,
                    })),
                ),
    });
    version = computed(() =>
        Math.max(0, ...(this.resource.value() || []).map((r) => r.info.version)),
    );
    menuColumn = createMenuColumn<LimitedVersionedObject>((d) => ({
        items: [
            {
                label: 'Revert to this version',
                disabled: d.info.version === this.version(),
                click: () => {
                    this.domainService
                        .get(d.ref, d.info.version)
                        .pipe(first())
                        .subscribe((obj) => {
                            this.domainObjectService
                                .edit(d.ref, getUnionValue(obj.object).data)
                                .next((res) => {
                                    if (res.status === DialogResponseStatus.Success) {
                                        this.resource.reload();
                                    }
                                });
                        });
                },
            },
        ],
    }));

    latest() {
        this.domainObjectService.view(this.ref());
    }

    edit() {
        this.domainObjectService.edit(this.ref()).next((res) => {
            if (res.status === DialogResponseStatus.Success) {
                this.resource.reload();
            }
        });
    }

    delete() {
        this.domainObjectService.delete(this.ref()).next(() => {
            this.sidenavInfoService.close();
        });
    }
}
