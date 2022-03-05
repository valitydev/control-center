import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { PayoutToolType } from '@vality/magista-proto';
import { PayoutStatus } from '@vality/magista-proto/lib/payout_manager';
import { Moment } from 'moment';
import * as moment from 'moment';
import { of } from 'rxjs';
import { share, startWith, switchMap } from 'rxjs/operators';

import { Party, Shop } from '@cc/app/api/damsel/gen-model/domain';
import {
    createValidatedAbstractControlProviders,
    ValidatedWrappedAbstractControlSuperclass,
} from '@cc/utils/forms';

import { PartyService } from '../../../../papi/party.service';

export interface PayoutsSearchForm {
    payoutId: string;
    merchant: Party;
    fromTime: Moment;
    toTime: Moment;
    shops: Shop[];
    payoutStatuses: (keyof PayoutStatus)[];
    payoutType: PayoutToolType;
}

@Component({
    selector: 'cc-payouts-search-form',
    templateUrl: './payouts-search-form.component.html',
    providers: createValidatedAbstractControlProviders(PayoutsSearchFormComponent),
})
export class PayoutsSearchFormComponent extends ValidatedWrappedAbstractControlSuperclass<
    PayoutsSearchForm
> {
    control = this.fb.group<PayoutsSearchForm>({
        payoutId: null,
        merchant: null,
        fromTime: [moment().subtract(1, 'year').startOf('d'), Validators.required],
        toTime: [moment().endOf('d'), Validators.required],
        shops: null,
        payoutStatuses: null,
        payoutType: null,
    });
    shops$ = this.control.controls.merchant.valueChanges.pipe(
        startWith(this.control.value.merchant),
        switchMap((party: Party) => (party ? this.partyService.getShops(party.id) : of([]))),
        share()
    );
    statuses: PayoutsSearchForm['payoutStatuses'] = ['unpaid', 'paid', 'cancelled', 'confirmed'];
    types: string[] = Object.values(PayoutToolType).filter(
        (v) => typeof v === 'string'
    ) as string[];
    payoutToolType = PayoutToolType;

    constructor(private fb: FormBuilder, private partyService: PartyService, injector: Injector) {
        super(injector);
    }
}
