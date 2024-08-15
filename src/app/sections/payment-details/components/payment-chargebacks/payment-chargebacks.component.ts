import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { DialogResponseStatus, DialogService } from '@vality/ng-core';
import { merge, defer, Subject } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

import { InvoicingService } from '../../../../api/payment-processing';
import { PageLayoutModule } from '../../../../shared';
import { ChargebacksComponent } from '../../../../shared/components/chargebacks/chargebacks.component';
import { CreateChargebackDialogComponent } from '../../create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsService } from '../../payment-details.service';

@Component({
    selector: 'cc-payment-chargebacks',
    standalone: true,
    imports: [CommonModule, PageLayoutModule, MatButton, ChargebacksComponent],
    templateUrl: './payment-chargebacks.component.html',
    styles: ``,
})
export class PaymentChargebacksComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
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
    private updateChargebacks$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private invoicingService: InvoicingService,
        private dialogService: DialogService,
        private dr: DestroyRef,
        private paymentDetailsService: PaymentDetailsService,
    ) {}

    createChargeback() {
        this.dialogService
            .open(
                CreateChargebackDialogComponent,
                this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>,
            )
            .afterClosed()
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(({ status }) => {
                if (status === DialogResponseStatus.Success) {
                    this.updateChargebacks$.next();
                }
            });
    }
}
