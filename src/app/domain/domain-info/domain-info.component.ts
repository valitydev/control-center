import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DomainObject, Reference } from '@vality/domain-proto/lib/domain';

import { DomainStoreService } from '../../thrift-services/damsel/domain-store.service';

@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
})
export class DomainInfoComponent {
    @ViewChild('domainObjDetails', { static: true }) detailsContainer: MatSidenav;

    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;
    objWithRef: { obj: DomainObject; ref: Reference } = null;

    constructor(
        private snackBar: MatSnackBar,
        private router: Router,
        private domainStoreService: DomainStoreService
    ) {}

    edit() {
        void this.router.navigate(['domain', 'edit', JSON.stringify(this.objWithRef.ref)]);
    }
}
