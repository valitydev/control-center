import { Component, Injector } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { FormBuilder } from '@ngneat/reactive-forms';
import { provideValueAccessor } from '@s-libs/ng-core';
import { Moment } from 'moment';

import { WrappedFormGroupSuperclass } from '../../../../utils';

@Component({
    selector: 'cc-date-range',
    templateUrl: './date-range.component.html',
    styleUrls: ['./date-range.component.scss'],
    providers: [provideValueAccessor(DateRangeComponent)],
})
export class DateRangeComponent extends WrappedFormGroupSuperclass<DateRange<Moment>> {
    control = this.fb.group({
        start: null,
        end: null,
    });

    constructor(injector: Injector, private fb: FormBuilder) {
        super(injector);
    }
}
