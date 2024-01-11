import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { DialogService, DialogResponseStatus } from '@vality/ng-core';
import { Subject, merge, defer, from } from 'rxjs';
import { shareReplay, switchMap, map } from 'rxjs/operators';

import { InvoicingService } from '@cc/app/api/payment-processing';

import { CreateChargebackDialogComponent } from './create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsService } from './payment-details.service';

@Component({
    templateUrl: 'payment-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentDetailsService],
})
export class PaymentDetailsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    shop$ = this.paymentDetailsService.shop$;

    chargebacks$ = merge(
        this.route.params,
        defer(() => this.updateChargebacks$),
    ).pipe(
        map(() => this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>),
        switchMap(({ invoiceID, paymentID }) =>
            this.invoicingService.GetPayment(invoiceID, paymentID),
        ),
        map(({ chargebacks }) => chargebacks),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    metadata$ = from(
        import('@vality/magista-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[]),
    );

    private updateChargebacks$ = new Subject<void>();

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private route: ActivatedRoute,
        private invoicingService: InvoicingService,
        private dialogService: DialogService,
        private destroyRef: DestroyRef,
    ) {}

    createChargeback() {
        this.dialogService
            .open(
                CreateChargebackDialogComponent,
                this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>,
            )
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ status }) => {
                if (status === DialogResponseStatus.Success) {
                    this.updateChargebacks$.next();
                }
            });
    }
}
