import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ReflessDomainObject } from '@vality/domain-proto/domain';
import { DialogResponseStatus } from '@vality/matez';

import { Domain2StoreService, FetchDomainObjectsService } from '../../../api/domain-config';
import { PageLayoutModule } from '../../../shared';
import { DomainObjectService } from '../../../shared/components/thrift-api-crud/domain2';

import { DomainObjectsTableComponent } from './domain-objects-table';

@Component({
    templateUrl: './domain-objects.component.html',
    styleUrls: ['./domain-objects.component.scss'],
    imports: [PageLayoutModule, DomainObjectsTableComponent, MatButtonModule],
    providers: [FetchDomainObjectsService],
})
export class DomainObjectsComponent {
    version = this.domainStoreService.version.value;
    selectedType = signal<keyof ReflessDomainObject>(null);

    constructor(
        private domainStoreService: Domain2StoreService,
        private domainObjectService: DomainObjectService,
        private fetchDomainObjectsService: FetchDomainObjectsService,
    ) {}

    create() {
        this.domainObjectService.create(this.selectedType()).next((result) => {
            if (result.status === DialogResponseStatus.Success) {
                this.fetchDomainObjectsService.reload();
            }
        });
    }
}
