import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { from } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '../../shared/services';
import { ModifiedDomainObjectService } from '../services/modified-domain-object.service';

@UntilDestroy()
@Component({
    templateUrl: './domain-obj-creation.component.html',
    styleUrls: ['../editor-container.scss'],
})
export class DomainObjCreationComponent {
    control = new FormControl(null, Validators.required);

    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modifiedDomainObjectService: ModifiedDomainObjectService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService
    ) {}

    reviewChanges() {
        this.modifiedDomainObjectService.update(this.control.value);
        void this.router.navigate(['domain', 'edit', this.route.snapshot.params.ref, 'review']);
    }
}
