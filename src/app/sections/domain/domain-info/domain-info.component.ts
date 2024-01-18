import { Component } from '@angular/core';
import { DialogService } from '@vality/ng-core';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud';

@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
})
export class DomainInfoComponent {
    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;

    constructor(
        private domainStoreService: DomainStoreService,
        private dialogService: DialogService,
    ) {}

    create() {
        this.dialogService.open(CreateDomainObjectDialogComponent);
    }
}
