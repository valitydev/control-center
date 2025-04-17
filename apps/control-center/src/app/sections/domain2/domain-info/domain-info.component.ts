import { Component, signal } from '@angular/core';
import { DialogService } from '@vality/matez';

import { DomainStoreService } from '../../../api/domain-config/stores/domain-store.service';
import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud';

@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
    standalone: false,
})
export class DomainInfoComponent {
    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;
    selectedType = signal<string>(null);

    constructor(
        private domainStoreService: DomainStoreService,
        private dialogService: DialogService,
    ) {}

    create() {
        this.dialogService.open(
            CreateDomainObjectDialogComponent,
            this.selectedType() ? { objectType: this.selectedType() } : undefined,
        );
    }
}
