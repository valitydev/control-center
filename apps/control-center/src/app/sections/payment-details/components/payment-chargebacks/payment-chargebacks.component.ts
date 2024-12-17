import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { DialogResponseStatus, DialogService } from '@vality/ng-core';
import { first } from 'rxjs';

import { FetchChargebacksService } from '@cc/app/sections/chargebacks/fetch-chargebacks.service';
import { ChargebacksTableComponent } from '@cc/app/shared/components/chargebacks-table';

import { PageLayoutModule } from '../../../../shared';
import { CreateChargebackDialogComponent } from '../../create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsService } from '../../payment-details.service';

@Component({
    selector: 'cc-payment-chargebacks',
    standalone: true,
    imports: [CommonModule, PageLayoutModule, MatButton, ChargebacksTableComponent],
    templateUrl: './payment-chargebacks.component.html',
    providers: [FetchChargebacksService],
})
export class PaymentChargebacksComponent implements OnInit {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    chargebacks$ = this.fetchChargebacksService.result$;

    constructor(
        private route: ActivatedRoute,
        private dialogService: DialogService,
        private dr: DestroyRef,
        private paymentDetailsService: PaymentDetailsService,
        protected fetchChargebacksService: FetchChargebacksService,
    ) {}

    ngOnInit() {
        this.update();
    }

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
                    this.update();
                }
            });
    }

    update() {
        this.payment$.pipe(first(), takeUntilDestroyed(this.dr)).subscribe((p) => {
            this.fetchChargebacksService.load({
                common_search_query_params: {
                    from_time: new Date(0).toISOString(),
                    to_time: new Date().toISOString(),
                },
                payment_id: p.id,
                invoice_ids: [p.invoice_id],
            });
        });
    }
}