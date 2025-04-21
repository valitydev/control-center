import { Component, signal } from '@angular/core';
import { DialogService } from '@vality/matez';

import { Domain2StoreService } from '../../../api/domain-config';
import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud';

@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
    standalone: false,
})
export class DomainInfoComponent {
    version$ = this.domainStoreService.version$;
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
