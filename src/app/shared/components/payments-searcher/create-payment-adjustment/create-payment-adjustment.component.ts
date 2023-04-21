import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/payment_processing';
import { StatPayment } from '@vality/magista-proto/magista';
import { DialogSuperclass } from '@vality/ng-core';
import chunk from 'lodash-es/chunk';
import { BehaviorSubject, from, concatMap, of, forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

import { InvoicingService } from '../../../../api/payment-processing';
import { NotificationService } from '../../../services/notification';
import { NotificationErrorService } from '../../../services/notification-error';

@UntilDestroy()
@Component({
    selector: 'cc-create-payment-adjustment',
    templateUrl: './create-payment-adjustment.component.html',
})
export class CreatePaymentAdjustmentComponent extends DialogSuperclass<
    CreatePaymentAdjustmentComponent,
    { payments: StatPayment[] },
    { withError?: { payment: StatPayment; error: any }[] }
> {
    control = new FormControl<InvoicePaymentAdjustmentParams>(null);
    progress$ = new BehaviorSubject(0);
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    withError: { payment: StatPayment; error: any }[] = [];

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
        const payments = this.withError.length
            ? this.withError.map((w) => w.payment)
            : this.dialogData.payments;
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
                                    catchError((error) => {
                                        this.withError.push({ payment: p, error });
                                        return of(null);
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
                        const errors = this.withError
                            .map((w) => {
                                const error: string = w.error?.name || w.error?.message || '';
                                if (error) return `${w.payment.id}: ${error}`;
                                return null;
                            })
                            .filter(Boolean)
                            .join(', ');
                        this.notificationErrorService.error(
                            new Error(
                                `${this.withError.length} out of ${payments.length} failed. Errors: ${errors}`
                            )
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
