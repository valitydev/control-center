import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { PartyID, ShopID } from '@vality/domain-proto';
import { PayoutStatusType, PayoutToolType } from '@vality/magista-proto';
import { Party, Shop } from '@vality/magista-proto/lib/domain';
import { Moment } from 'moment';

import { createControlProviders, ValidatedControlSuperclass } from '@cc/utils/forms';
import { getEnumKeys } from '@cc/utils/get-enum-keys';

export interface PayoutsSearchForm {
    payoutId: string;
    partyId: Party['id'];
    dateRange: DateRange<Moment>;
    shops: Shop['id'][];
    payoutStatusTypes: PayoutStatusType[];
    payoutToolType: PayoutToolType;
}

@Component({
    selector: 'cc-payouts-search-form',
    templateUrl: './payouts-search-form.component.html',
    providers: createControlProviders(() => PayoutsSearchFormComponent),
})
export class PayoutsSearchFormComponent extends ValidatedControlSuperclass<PayoutsSearchForm> {
    control = this.fb.group({
        payoutId: null as string,
        partyId: null as PartyID,
        dateRange: [null, Validators.required],
        shops: null as ShopID[],
        payoutStatusTypes: null as PayoutStatusType[],
        payoutToolType: null as PayoutToolType,
    });

    statusType = PayoutStatusType;
    statusTypes = getEnumKeys(PayoutStatusType);

    payoutToolType = PayoutToolType;
    payoutToolTypes = getEnumKeys(PayoutToolType);

    constructor(private fb: FormBuilder) {
        super();
    }
}
