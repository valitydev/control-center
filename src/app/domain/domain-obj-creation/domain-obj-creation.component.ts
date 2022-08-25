import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DomainObject } from '@vality/domain-proto/lib/domain';
import { from, BehaviorSubject } from 'rxjs';

import { progressTo } from '../../../utils';
import { DomainMetadataFormExtensionsService } from '../../shared/services';
import { ErrorService } from '../../shared/services/error';
import { NotificationService } from '../../shared/services/notification';
import { DomainStoreService } from '../../thrift-services/damsel/domain-store.service';

@UntilDestroy()
@Component({
    templateUrl: './domain-obj-creation.component.html',
    styleUrls: ['../editor-container.scss'],
})
export class DomainObjCreationComponent {
    control = new FormControl<DomainObject>(null, Validators.required);
    review = false;

    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    progress$ = new BehaviorSubject(0);

    constructor(
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private domainStoreService: DomainStoreService,
        private notificationService: NotificationService,
        private errorService: ErrorService,
        private router: Router
    ) {}

    reviewChanges() {
        this.review = true;
    }

    commit() {
        this.domainStoreService
            .commit({ ops: [{ insert: { object: this.control.value } }] })
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.notificationService.success('Successfully created');
                    void this.router.navigate(['domain']);
                },
                error: (err) => {
                    this.errorService.error(err);
                },
            });
    }
}
