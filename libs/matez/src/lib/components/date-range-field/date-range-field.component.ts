import { Component, Input, booleanAttribute } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateFnsAdapter, MAT_DATE_FNS_FORMATS } from '@angular/material-date-fns-adapter';
import { enGB } from 'date-fns/locale';

import { FormGroupSuperclass, createControlProviders } from '../../utils';

import { DateRange } from './types/date-range';

@Component({
    selector: 'v-date-range-field',
    templateUrl: './date-range-field.component.html',
    styleUrls: ['./date-range-field.component.scss'],
    providers: [
        ...createControlProviders(() => DateRangeFieldComponent),
        { provide: MAT_DATE_LOCALE, useValue: enGB },
        { provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS },
    ],
    standalone: false
})
export class DateRangeFieldComponent extends FormGroupSuperclass<Partial<DateRange>> {
    @Input({ transform: booleanAttribute }) required: boolean = false;

    control = this.fb.group<Partial<DateRange>>({
        start: undefined,
        end: undefined,
    });

    constructor(private fb: NonNullableFormBuilder) {
        super();
    }
}
