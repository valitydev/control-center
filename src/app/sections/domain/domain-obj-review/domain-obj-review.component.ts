import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { first, withLatestFrom } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { DomainSecretService } from '@cc/app/shared/services/domain-secret-service';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { getUnionKey } from '../../../../utils';
import { NotificationService } from '../../../shared/services/notification';
import { DomainNavigateService } from '../services/domain-navigate.service';
import { DomainObjModificationService } from '../services/domain-obj-modification.service';
import { ModifiedDomainObjectService } from '../services/modified-domain-object.service';

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
        private notificationErrorService: NotificationErrorService,
        private domainNavigateService: DomainNavigateService,
        private domainSecretService: DomainSecretService,
        private destroyRef: DestroyRef,
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
                    }),
                ),
                withLatestFrom(this.type$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ([, type]) => {
                    this.notificationService.success('Successfully changed');
                    void this.domainNavigateService.toType(type);
                },
                error: (err) => {
                    this.notificationErrorService.error(err);
                },
            });
    }

    back() {
        void this.router.navigate(['domain', 'edit'], {
            queryParams: { ref: this.route.snapshot.queryParams.ref },
        });
    }
}
