import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { DialogService, DialogResponseStatus } from '@vality/ng-core';
import { Subject, merge, defer, from } from 'rxjs';
import { pluck, shareReplay, switchMap, map } from 'rxjs/operators';

import { InvoicingService } from '@cc/app/api/payment-processing';

import { CreateChargebackDialogComponent } from './create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsService } from './payment-details.service';

@UntilDestroy()
@Component({
    templateUrl: 'payment-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentDetailsService],
})
export class PaymentDetailsComponent {
    partyID$ = this.route.params.pipe(pluck('partyID'));
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    shop$ = this.paymentDetailsService.shop$;

    chargebacks$ = merge(
        this.route.params,
        defer(() => this.updateChargebacks$)
    ).pipe(
        map(() => this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>),
        switchMap(({ invoiceID, paymentID }) =>
            this.invoicingService.GetPayment(invoiceID, paymentID)
        ),
        map(({ chargebacks }) => chargebacks),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    metadata$ = from(
        import('@vality/magista-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[])
    );

    private updateChargebacks$ = new Subject<void>();

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private route: ActivatedRoute,
        private invoicingService: InvoicingService,
        private dialogService: DialogService
    ) {}

    createChargeback() {
        this.dialogService
            .open(
                CreateChargebackDialogComponent,
                this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>
            )
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(({ status }) => {
                if (status === DialogResponseStatus.Success) this.updateChargebacks$.next();
            });
    }
}
