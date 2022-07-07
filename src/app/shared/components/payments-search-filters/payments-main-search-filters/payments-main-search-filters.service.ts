import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PartyID } from '@vality/domain-proto';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { debounceTime, filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';

import { SearchFiltersParams } from '../search-filters-params';
import { formValueToSearchParams } from './form-value-to-search-params';
import { searchParamsToFormParams } from './search-params-to-form-params';

@Injectable()
export class PaymentsMainSearchFiltersService {
    private getShops$ = new ReplaySubject<string>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    form = this.fb.group({
        fromTime: [moment().subtract(1, 'year').startOf('d'), Validators.required],
        toTime: [moment().endOf('d'), Validators.required],
        invoiceID: '',
        partyID: '',
        shopIDs: [],
        bin: ['', [Validators.pattern(/\d{6}$/), Validators.maxLength(6)]],
        pan: ['', [Validators.pattern(/\d{4}$/), Validators.maxLength(4)]],
        rrn: '',
    });

    // eslint-disable-next-line @typescript-eslint/member-ordering
    searchParamsChanges$ = this.form.valueChanges.pipe(
        debounceTime(600),
        filter(() => this.form.valid),
        map(formValueToSearchParams),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    shops$ = this.getShops$.pipe(
        switchMap((partyID) => this.partyManagementWithUserService.getParty(partyID)),
        map(({ shops }) => Array.from(shops.values())),
        shareReplay(1)
    );

    constructor(
        private partyManagementWithUserService: PartyManagementWithUserService,
        private fb: UntypedFormBuilder
    ) {}

    getShops(partyID: PartyID) {
        this.getShops$.next(partyID);
    }

    init(params: SearchFiltersParams) {
        this.form.patchValue(searchParamsToFormParams(params));
    }
}
