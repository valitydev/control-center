import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { PaymentInstitutionObject, PaymentInstitutionRef } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';
import sortBy from 'lodash-es/sortBy';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

@Component({
    selector: 'cc-payment-institution-ref',
    templateUrl: 'payment-institution-ref.component.html',
})
export class PaymentInstitutionRefComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    required: boolean;

    @Input()
    initialValue: PaymentInstitutionRef;

    isLoading = true;

    paymentInstitutions$: Observable<PaymentInstitutionObject[]>;

    constructor(
        private fb: UntypedFormBuilder,
        private domainStoreService: DomainStoreService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.paymentInstitutions$ = this.domainStoreService.getObjects('payment_institution').pipe(
            map((paymentInstitutions) =>
                sortBy(paymentInstitutions, (paymentInstitution) => paymentInstitution.ref.id)
            ),
            tap(
                () => {
                    this.form.controls.id.enable();
                    this.isLoading = false;
                },
                () => {
                    this.isLoading = false;
                    this.snackBar.open(
                        'An error occurred while payment institutions receiving',
                        'OK'
                    );
                }
            )
        );
        const paymentInstitutionId = get(this, 'initialValue.id', '');
        this.form.registerControl(
            'id',
            this.fb.control(paymentInstitutionId, this.required ? Validators.required : null)
        );
        this.form.updateValueAndValidity();
    }
}
