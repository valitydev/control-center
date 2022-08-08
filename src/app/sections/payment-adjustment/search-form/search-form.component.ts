import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentStatus } from '@vality/magista-proto';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

import { getEnumKeys } from '../../../../utils';
import { PaymentAdjustmentService } from '../payment-adjustment.service';
import { SearchFormParams } from './search-form-params';
import { toSearchParams } from './to-search-params';

@UntilDestroy()
@Component({
    selector: 'cc-payment-adjustment-search-form',
    templateUrl: './search-form.component.html',
})
export class SearchFormComponent implements OnInit {
    @Output() valueChanges = new EventEmitter<SearchFormParams>();
    @Output() statusChanges = new EventEmitter<string>();

    form: UntypedFormGroup;

    statuses = getEnumKeys(InvoicePaymentStatus);
    statusEnum = InvoicePaymentStatus;

    constructor(
        private paymentAdjustmentService: PaymentAdjustmentService,
        private fb: UntypedFormBuilder
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            fromTime: [moment(), Validators.required],
            toTime: [moment(), Validators.required],
            invoiceIds: '',
            partyId: ['', Validators.required],
            shopId: '',
            fromRevision: [0, Validators.required],
            toRevision: ['', Validators.required],
            providerID: '',
            terminalID: '',
            status: 'captured',
        });
        this.form.valueChanges
            .pipe(map(toSearchParams), untilDestroyed(this))
            .subscribe((value) => this.valueChanges.emit(value));
        this.form.statusChanges
            .pipe(untilDestroyed(this))
            .subscribe((status) => this.statusChanges.emit(status));
        this.paymentAdjustmentService.domainVersion$
            .pipe(untilDestroyed(this))
            .subscribe((version) => {
                this.form.patchValue({
                    toRevision: version,
                });
            });
    }
}
