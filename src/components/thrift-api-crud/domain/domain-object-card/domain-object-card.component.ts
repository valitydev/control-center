import { catchError } from 'rxjs';

import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

import { Reference } from '@vality/domain-proto/domain';
import {
    DialogResponseStatus,
    NotifyLogService,
    UnionEnum,
    createStorageValue,
    enumHasValue,
} from '@vality/matez';
import { ThriftPipesModule, ViewerKind } from '@vality/ng-thrift';

import { DomainService } from '~/api/domain-config';

import { SidenavInfoModule, SidenavInfoService } from '../../../sidenav-info';
import { CardComponent } from '../../../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../../domain/domain-thrift-viewer';
import { getDomainObjectDetails } from '../../domain/utils';
import { DomainObjectService } from '../services/domain-object.service';

@Component({
    selector: 'cc-domain-object-card',
    imports: [
        DomainThriftViewerComponent,
        CardComponent,
        SidenavInfoModule,
        MatButtonModule,
        ThriftPipesModule,
    ],
    templateUrl: './domain-object-card.component.html',
})
export class DomainObjectCardComponent {
    private domainObjectService = inject(DomainObjectService);
    private domainService = inject(DomainService);
    private log = inject(NotifyLogService);
    private sidenavInfoService = inject(SidenavInfoService);

    ref = input<Reference>();
    version = input<number>();

    domainObject = rxResource({
        params: () => ({ ref: this.ref(), version: this.version() }),
        stream: ({ params: { ref, version } }) =>
            this.domainService.get(ref, version).pipe(
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'domain object');
                    throw err;
                }),
            ),
    });
    details = computed(() => getDomainObjectDetails(this.domainObject.value()?.object));
    kind = createStorageValue<UnionEnum<ViewerKind>>('domain-object-card-view', {
        deserialize: (v) => (enumHasValue(ViewerKind, v) ? v : ViewerKind.Component),
    });

    history() {
        this.domainObjectService.history(this.ref());
    }

    edit() {
        this.domainObjectService.edit(this.ref()).next((res) => {
            if (res.status === DialogResponseStatus.Success && !this.version()) {
                this.domainObject.reload();
            }
        });
    }

    delete() {
        this.domainObjectService.delete(this.ref()).next(() => {
            this.sidenavInfoService.close();
        });
    }
}
