import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { Moment } from 'moment';

import { createControlProviders, ValidatedControlSuperclass } from '../../../../utils';

@Component({
    selector: 'cc-date-range',
    templateUrl: './date-range.component.html',
    styleUrls: ['./date-range.component.scss'],
    providers: createControlProviders(DateRangeComponent),
})
export class DateRangeComponent extends ValidatedControlSuperclass<DateRange<Moment>> {
    control = this.fb.group({
        start: null,
        end: null,
    });

    constructor(private fb: FormBuilder) {
        super();
    }
}
