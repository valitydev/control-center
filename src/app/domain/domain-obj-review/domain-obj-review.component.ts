import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs';
import { first, withLatestFrom } from 'rxjs/operators';

import { DomainSecretService } from '@cc/app/shared/services/domain-secret-service';

import { getUnionKey } from '../../../utils';
import { ErrorService } from '../../shared/services/error';
import { NotificationService } from '../../shared/services/notification';
import { DomainStoreService } from '../../thrift-services/damsel/domain-store.service';
import { DomainNavigateService } from '../services/domain-navigate.service';
import { DomainObjModificationService } from '../services/domain-obj-modification.service';
import { ModifiedDomainObjectService } from '../services/modified-domain-object.service';

@UntilDestroy()
@Component({
    templateUrl: './domain-obj-review.component.html',
    styleUrls: ['../editor-container.scss'],
    providers: [DomainObjModificationService],
})
export class DomainObjReviewComponent {
    progress$ = this.domainObjModService.progress$;
    object$ = this.domainObjModService.object$;
    type$ = this.domainObjModService.type$;
    modifiedObject = this.modifiedDomainObjectService.domainObject;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private domainObjModService: DomainObjModificationService,
        private modifiedDomainObjectService: ModifiedDomainObjectService,
        private domainStoreService: DomainStoreService,
        private notificationService: NotificationService,
        private errorService: ErrorService,
        private domainNavigateService: DomainNavigateService,
        private domainSecretService: DomainSecretService
    ) {
        if (!modifiedDomainObjectService.domainObject) {
            this.back();
        }
    }

    commit() {
        this.domainObjModService.fullObject$
            .pipe(
                first(),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                switchMap((old_object) =>
                    this.domainStoreService.commit({
                        ops: [
                            {
                                update: {
                                    old_object,
                                    new_object: this.domainSecretService.restoreDomain(old_object, {
                                        [getUnionKey(old_object)]: this.modifiedObject,
                                    }),
                                },
                            },
                        ],
                    })
                ),
                withLatestFrom(this.type$),
                untilDestroyed(this)
            )
            .subscribe({
                next: ([, type]) => {
                    this.notificationService.success('Successfully changed');
                    void this.domainNavigateService.toType(type);
                },
                error: (err) => {
                    this.errorService.error(err);
                },
            });
    }

    back() {
        void this.router.navigate(['domain', 'edit', this.route.snapshot.params.ref]);
    }
}
