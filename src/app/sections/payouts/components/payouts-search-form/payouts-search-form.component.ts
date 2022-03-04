import { Component } from '@angular/core';
import { FormBuilder } from '@ngneat/reactive-forms';
import { Moment } from 'moment';
import { of } from 'rxjs';
import { share, startWith, switchMap } from 'rxjs/operators';

import { Party, Shop } from '@cc/app/api/damsel/gen-model/domain';

import { PartyService } from '../../../../papi/party.service';

@Component({
    selector: 'cc-payouts-search-form',
    templateUrl: './payouts-search-form.component.html',
})
export class PayoutsSearchFormComponent {
    form = this.fb.group<{
        payoutId: string;
        merchant: Party;
        fromTime: Moment;
        toTime: Moment;
        shops: Shop[];
    }>({
        payoutId: null,
        merchant: null,
        fromTime: null,
        toTime: null,
        shops: null,
    });
    shops$ = this.form.controls.merchant.valueChanges.pipe(
        startWith(this.form.value.merchant),
        switchMap((party: Party) => (party ? this.partyService.getShops(party.id) : of([]))),
        share()
    );

    constructor(private fb: FormBuilder, private partyService: PartyService) {}
}
