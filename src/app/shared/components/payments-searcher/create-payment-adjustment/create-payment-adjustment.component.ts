import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/payment_processing';
import { StatPayment } from '@vality/magista-proto';
import { BaseDialogSuperclass } from '@vality/ng-core';
import chunk from 'lodash-es/chunk';
import { BehaviorSubject, from, concatMap, of, forkJoin } from 'rxjs';
import { catchError, finalize, delay } from 'rxjs/operators';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

import { InvoicingService } from '../../../../api/payment-processing';
import { NotificationService } from '../../../services/notification';
import { NotificationErrorService } from '../../../services/notification-error';

@UntilDestroy()
@Component({
    selector: 'cc-create-payment-adjustment',
    templateUrl: './create-payment-adjustment.component.html',
})
export class CreatePaymentAdjustmentComponent extends BaseDialogSuperclass<
    CreatePaymentAdjustmentComponent,
    { payments: StatPayment[] },
    { withError?: StatPayment[] }
> {
    control = new FormControl<InvoicePaymentAdjustmentParams>(null);
    progress$ = new BehaviorSubject(0);
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    withError: StatPayment[] = [];

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private notificationService: NotificationService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private notificationErrorService: NotificationErrorService
    ) {
        super(injector);
    }

    create() {
        const payments = this.withError.length ? this.withError : this.dialogData.payments;
        this.withError = [];
        const progressStep = 100 / (payments.length + 1);
        this.progress$.next(progressStep);
        of(...chunk(payments, 4))
            .pipe(
                concatMap((payments) =>
                    forkJoin(
                        payments.map((p) =>
                            this.invoicingService
                                .CreatePaymentAdjustment(p.invoice_id, p.id, this.control.value)
                                .pipe(
                                    delay(Math.random() * 10000),
                                    catchError(() => {
                                        this.withError.push(p);
                                        return null;
                                    }),
                                    finalize(() =>
                                        this.progress$.next(this.progress$.value + progressStep)
                                    )
                                )
                        )
                    )
                ),
                untilDestroyed(this)
            )
            .subscribe({
                complete: () => {
                    if (!this.withError.length) {
                        this.notificationService.success(`${payments.length} created successfully`);
                        this.closeWithSuccess();
                    } else {
                        this.notificationErrorService.error(
                            new Error(`${this.withError.length} out of ${payments.length} failed`)
                        );
                    }
                    this.progress$.next(0);
                },
            });
    }

    closeAndSelectWithAnError() {
        this.closeWithError({ withError: this.withError });
    }
}
