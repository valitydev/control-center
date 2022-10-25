import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PartyID } from '@vality/domain-proto';
import * as moment from 'moment';
import { ReplaySubject, defer } from 'rxjs';
import { debounceTime, filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

import { SearchFiltersParams } from '../search-filters-params';
import { searchParamsToFormParams } from './search-params-to-form-params';

@Injectable()
export class PaymentsMainSearchFiltersService {
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

    searchParamsChanges$ = this.form.valueChanges.pipe(
        debounceTime(600),
        filter(() => this.form.valid),
        shareReplay(1)
    );

    shops$ = defer(() => this.getShops$).pipe(
        switchMap((partyID) => this.partyManagementService.Get(partyID)),
        map(({ shops }) => Array.from(shops.values())),
        shareReplay(1)
    );

    private getShops$ = new ReplaySubject<string>();

    constructor(
        private partyManagementService: PartyManagementService,
        private fb: UntypedFormBuilder
    ) {}

    getShops(partyID: PartyID) {
        this.getShops$.next(partyID);
    }

    init(params: SearchFiltersParams) {
        this.form.patchValue(searchParamsToFormParams(params));
    }
}
