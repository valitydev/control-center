import { Component, Injector } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { FormBuilder } from '@ngneat/reactive-forms';
import { Moment } from 'moment';

import { createControlProviders, ValidatedFormGroupSuperclass } from '../../../../utils';

@Component({
    selector: 'cc-date-range',
    templateUrl: './date-range.component.html',
    styleUrls: ['./date-range.component.scss'],
    providers: createControlProviders(DateRangeComponent),
})
export class DateRangeComponent extends ValidatedFormGroupSuperclass<DateRange<Moment>> {
    control = this.fb.group({
        start: null,
        end: null,
    });

    constructor(injector: Injector, private fb: FormBuilder) {
        super(injector);
    }
}
