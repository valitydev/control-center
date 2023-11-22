import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

import { DomainStoreService } from '@cc/app/api/domain-config';

@UntilDestroy()
@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
})
export class DomainInfoComponent {
    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;

    constructor(private domainStoreService: DomainStoreService) {}
}
