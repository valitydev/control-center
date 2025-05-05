import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ReflessDomainObject } from '@vality/domain-proto/domain';
import { DialogResponseStatus, DialogService } from '@vality/matez';

import { Domain2StoreService, FetchDomainObjectsService } from '../../../api/domain-config';
import { PageLayoutModule } from '../../../shared';
import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud/domain2';

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
        private dialogService: DialogService,
        private fetchDomainObjectsService: FetchDomainObjectsService,
    ) {}

    create() {
        this.dialogService
            .open(
                CreateDomainObjectDialogComponent,
                this.selectedType() ? { objectType: this.selectedType() } : undefined,
            )
            .afterClosed()
            .subscribe((result) => {
                if (result.status === DialogResponseStatus.Success) {
                    this.fetchDomainObjectsService.reload();
                }
            });
    }
}
