import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { debounceTime, filter, map, shareReplay } from 'rxjs/operators';

import { SearchParams } from '../../../types/search-params';
import { formValueToSearchParams } from '../../utils/form-value-to-search-params';
import { searchParamsToFormParams } from '../../utils/search-params-to-form-params';

@Injectable()
export class SearchFiltersService {
    form = this.fb.group({
        fromTime: [moment().subtract(1, 'year').startOf('d'), Validators.required],
        toTime: [moment().endOf('d'), Validators.required],
        amountTo: null,
        currencyCode: null,
        status: null,
        depositId: '',
        identityId: '',
        walletId: '',
        partyId: '',
    });

    searchParamsChanges$ = this.form.valueChanges.pipe(
        debounceTime(600),
        filter(() => this.form.valid),
        map(formValueToSearchParams),
        shareReplay(1)
    );

    constructor(private fb: UntypedFormBuilder) {}

    init(params: SearchParams) {
        this.form.patchValue(searchParamsToFormParams(params));
    }
}
