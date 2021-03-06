import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatPayment } from '@vality/domain-proto/lib/merch_stat';

import { CreateAndCaptureComponent } from './create-and-capture/create-and-capture.component';
import { PaymentAdjustmentService } from './payment-adjustment.service';
import { SearchFormParams } from './search-form/search-form-params';

@UntilDestroy()
@Component({
    selector: 'cc-payment-adjustment',
    templateUrl: './payment-adjustment.component.html',
    styleUrls: ['payment-adjustment.component.scss'],
    providers: [PaymentAdjustmentService],
})
export class PaymentAdjustmentComponent implements OnInit {
    isLoading = false;

    payments: StatPayment[] = [];

    selectedPayments: StatPayment[] = [];

    searchParams: SearchFormParams;

    formValid: boolean;

    constructor(
        private dialogRef: MatDialog,
        private paymentAdjustmentService: PaymentAdjustmentService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.paymentAdjustmentService.searchPaymentChanges$
            .pipe(untilDestroyed(this))
            .subscribe((payments) => {
                this.payments = payments;
            });
    }

    formValueChanges(params: SearchFormParams) {
        this.searchParams = params;
    }

    formStatusChanges(status: string) {
        this.formValid = status === 'VALID';
    }

    create() {
        this.dialogRef.open(CreateAndCaptureComponent, {
            width: '800px',
            disableClose: true,
            data: this.selectedPayments,
        });
    }

    changeSelected(e) {
        this.selectedPayments = e;
    }

    search() {
        this.payments = [];
        this.selectedPayments = [];
        this.isLoading = true;
        this.paymentAdjustmentService
            .fetchPayments(this.searchParams)
            .pipe(untilDestroyed(this))
            .subscribe(
                () => {
                    this.selectedPayments = [];
                    this.isLoading = false;
                },
                (e) => {
                    this.snackBar.open(`${String(e.message || 'Error')}`, 'OK');
                    this.isLoading = false;
                    console.error(e);
                }
            );
    }
}
