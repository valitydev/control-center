import { first } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

import { DialogResponseStatus, DialogService } from '@vality/matez';

import { FetchChargebacksService } from '../../../../chargebacks/fetch-chargebacks.service';
import { PageLayoutModule } from '../../../../shared';
import { ChargebacksTableComponent } from '../../../../shared/components/chargebacks-table/chargebacks-table.component';
import { CreateChargebackDialogComponent } from '../../create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsService } from '../../payment.service';

@Component({
    selector: 'cc-payment-chargebacks',
    imports: [CommonModule, PageLayoutModule, MatButton, ChargebacksTableComponent],
    templateUrl: './payment-chargebacks.component.html',
    providers: [FetchChargebacksService],
})
export class PaymentChargebacksComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private dialogService = inject(DialogService);
    private dr = inject(DestroyRef);
    private paymentDetailsService = inject(PaymentDetailsService);
    protected fetchChargebacksService = inject(FetchChargebacksService);
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    chargebacks$ = this.fetchChargebacksService.result$;

    ngOnInit() {
        this.update();
    }

    createChargeback() {
        const [invoiceID, paymentID] = this.route.snapshot.params['paymentID'].split('.');

        this.dialogService
            .open(CreateChargebackDialogComponent, { invoiceID, paymentID })
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
