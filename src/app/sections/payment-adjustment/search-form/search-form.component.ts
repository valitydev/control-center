import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

import { PaymentAdjustmentService } from '../payment-adjustment.service';
import { SearchFormParams } from './search-form-params';
import { toSearchParams } from './to-search-params';

@UntilDestroy()
@Component({
    selector: 'cc-payment-adjustment-search-form',
    templateUrl: './search-form.component.html',
})
export class SearchFormComponent implements OnInit {
    @Output()
    valueChanges: EventEmitter<SearchFormParams> = new EventEmitter();

    @Output()
    statusChanges: EventEmitter<string> = new EventEmitter();

    form: UntypedFormGroup;

    statuses: string[] = ['pending', 'processed', 'captured', 'cancelled', 'refunded', 'failed'];

    constructor(
        private paymentAdjustmentService: PaymentAdjustmentService,
        private fb: UntypedFormBuilder
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            fromTime: [moment(), Validators.required],
            toTime: [moment(), Validators.required],
            invoiceIds: '',
            partyId: '',
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
