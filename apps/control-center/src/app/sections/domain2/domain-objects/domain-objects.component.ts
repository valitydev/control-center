import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DialogService } from '@vality/matez';

import { Domain2StoreService } from '../../../api/domain-config';
import { PageLayoutModule } from '../../../shared';
import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud';

import { DomainObjectsTableComponent } from './domain-objects-table';

@Component({
    templateUrl: './domain-objects.component.html',
    styleUrls: ['./domain-objects.component.scss'],
    standalone: true,
    imports: [PageLayoutModule, DomainObjectsTableComponent, MatButtonModule],
})
export class DomainObjectsComponent {
    version = this.domainStoreService.version.value;
    selectedType = signal<string>(null);

    constructor(
        private domainStoreService: Domain2StoreService,
        private dialogService: DialogService,
    ) {}

    create() {
        this.dialogService.open(
            CreateDomainObjectDialogComponent,
            this.selectedType() ? { objectType: this.selectedType() } : undefined,
        );
    }
}
