import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';
import { PartyID, ShopID } from '@vality/domain-proto';
import { PayoutStatusType, PayoutToolType } from '@vality/magista-proto';
import { Party, Shop } from '@vality/magista-proto/lib/domain';
import { Moment } from 'moment';
import * as moment from 'moment';

import { WrappedFormGroupSuperclass } from '@cc/utils/forms';
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
    providers: [provideValueAccessor(PayoutsSearchFormComponent)],
})
export class PayoutsSearchFormComponent extends WrappedFormGroupSuperclass<PayoutsSearchForm> {
    control = this.fb.group({
        payoutId: null as string,
        partyId: null as PartyID,
        fromTime: [moment().subtract(1, 'year').startOf('d'), Validators.required],
        toTime: [moment().endOf('d'), Validators.required],
        shops: null as ShopID[],
        payoutStatusTypes: null as PayoutStatusType[],
        payoutToolType: null as PayoutToolType,
    });

    statusType = PayoutStatusType;
    statusTypes = getEnumKeys(PayoutStatusType);

    payoutToolType = PayoutToolType;
    payoutToolTypes = getEnumKeys(PayoutToolType);

    constructor(private fb: FormBuilder, injector: Injector) {
        super(injector);
    }
}
