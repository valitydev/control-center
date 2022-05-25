import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { PayoutStatusType, PayoutToolType } from '@vality/magista-proto';
import { Party, Shop } from '@vality/magista-proto/lib/domain';
import { Moment } from 'moment';
import * as moment from 'moment';

import { createControlProviders, ValidatedControlSuperclass } from '@cc/utils/forms';
import { getEnumKeys } from '@cc/utils/get-enum-keys';

export interface PayoutsSearchForm {
    payoutId: string;
    partyId: Party['id'];
    fromTime: Moment;
    toTime: Moment;
    shops: Shop['id'][];
    payoutStatusTypes: PayoutStatusType[];
    payoutToolType: PayoutToolType;
}

@Component({
    selector: 'cc-payouts-search-form',
    templateUrl: './payouts-search-form.component.html',
    providers: createControlProviders(PayoutsSearchFormComponent),
})
export class PayoutsSearchFormComponent extends ValidatedControlSuperclass<PayoutsSearchForm> {
    control = this.fb.group<PayoutsSearchForm>({
        payoutId: null,
        partyId: null,
        fromTime: [moment().subtract(1, 'year').startOf('d'), Validators.required],
        toTime: [moment().endOf('d'), Validators.required],
        shops: null,
        payoutStatusTypes: null,
        payoutToolType: null,
    });

    statusType = PayoutStatusType;
    statusTypes = getEnumKeys(PayoutStatusType);

    payoutToolType = PayoutToolType;
    payoutToolTypes = getEnumKeys(PayoutToolType);

    constructor(private fb: FormBuilder, injector: Injector) {
        super(injector);
    }
}
