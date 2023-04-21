import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DialogService, DialogResponseStatus } from '@vality/ng-core';
import { Subject, merge, defer } from 'rxjs';
import { pluck, shareReplay, switchMap, map } from 'rxjs/operators';

import { InvoicingService } from '../../api/payment-processing/invoicing.service';
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
