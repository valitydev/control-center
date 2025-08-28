import { map } from 'rxjs';

import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { Reference } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import { pagedObservableResource } from '@vality/matez';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { DomainService } from '~/api/domain-config';

import { DomainObjectsTableComponent } from '../../../../app/domain-config/domain-objects-table';
import { SidenavInfoModule } from '../../../sidenav-info';
import { CardComponent } from '../../../sidenav-info/components/card/card.component';

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
}
