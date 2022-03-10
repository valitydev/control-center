import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { PayoutToolType } from '@vality/magista-proto';
import { Party, Shop } from '@vality/magista-proto/lib/domain';
import { PayoutStatus } from '@vality/magista-proto/lib/payout_manager';
import { Moment } from 'moment';
import * as moment from 'moment';
import { of } from 'rxjs';
import { share, startWith, switchMap } from 'rxjs/operators';

import {
    createValidatedAbstractControlProviders,
    ValidatedWrappedAbstractControlSuperclass,
} from '@cc/utils/forms';

import { PartyService } from '../../../../papi/party.service';

export interface PayoutsSearchForm {
    payoutId: string;
    partyId: Party['id'];
    fromTime: Moment;
    toTime: Moment;
    shops: Shop['id'][];
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
        partyId: null,
        fromTime: [moment().subtract(1, 'year').startOf('d'), Validators.required],
        toTime: [moment().endOf('d'), Validators.required],
        shops: null,
        payoutStatuses: null,
        payoutType: null,
    });
    shops$ = this.control.controls.partyId.valueChanges.pipe(
        startWith(this.control.value.partyId),
        switchMap((partyId) => (partyId ? this.partyService.getShops(partyId) : of([]))),
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
