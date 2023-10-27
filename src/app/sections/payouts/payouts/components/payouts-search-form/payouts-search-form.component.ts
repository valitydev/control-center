import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PartyID, Party, Shop, ShopID } from '@vality/domain-proto/domain';
import { magista } from '@vality/magista-proto';
import { DateRange } from '@vality/ng-core';

import { createControlProviders, ValidatedControlSuperclass } from '@cc/utils/forms';
import { getEnumKeys } from '@cc/utils/get-enum-keys';

export interface PayoutsSearchForm {
    payoutId: string;
    partyId: Party['id'];
    dateRange: DateRange;
    shops: Shop['id'][];
    payoutStatusTypes: magista.PayoutStatusType[];
    payoutToolType: magista.PayoutToolType;
}

@Component({
    selector: 'cc-payouts-search-form',
    templateUrl: './payouts-search-form.component.html',
    providers: createControlProviders(() => PayoutsSearchFormComponent),
})
export class PayoutsSearchFormComponent extends ValidatedControlSuperclass<PayoutsSearchForm> {
    control: FormGroup = this.fb.group({
        payoutId: null as string,
        partyId: null as PartyID,
        dateRange: [null, Validators.required],
        shops: null as ShopID[],
        payoutStatusTypes: null as magista.PayoutStatusType[],
        payoutToolType: null as magista.PayoutToolType,
    });

    statusType = magista.PayoutStatusType;
    statusTypes = getEnumKeys(magista.PayoutStatusType);

    payoutToolType = magista.PayoutToolType;
    payoutToolTypes = getEnumKeys(magista.PayoutToolType);

    constructor(private fb: FormBuilder) {
        super();
    }
}
