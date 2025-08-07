import { Component, Input, booleanAttribute } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateFnsAdapter, MAT_DATE_FNS_FORMATS } from '@angular/material-date-fns-adapter';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { format, isValid } from 'date-fns';
import { enGB } from 'date-fns/locale';

import {
    createControlProviders,
    createDateFromNoTimeZoneString,
    getNoTimeZoneIsoString,
} from '../../utils';

@Component({
    selector: 'v-datetime-field',
    templateUrl: './datetime-field.component.html',
    styleUrls: ['datetime-field.component.scss'],
    providers: [
        ...createControlProviders(() => DatetimeFieldComponent),
        { provide: MAT_DATE_LOCALE, useValue: enGB },
        { provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS },
    ],
    standalone: false,
})
export class DatetimeFieldComponent extends FormComponentSuperclass<string> {
    @Input() label?: string;
    @Input({ transform: booleanAttribute }) required = false;
    @Input() hint?: string;

    datetime?: Date | null;

    get time() {
        return this.datetime ? format(this.datetime, 'HH:mm') : '';
    }

    handleIncomingValue(value: string) {
        this.datetime = value ? createDateFromNoTimeZoneString(value) : null;
    }

    timeChanged(event: Event) {
        const [hours, minutes] = (event.target as HTMLInputElement).value.split(':');
        if (!this.datetime) {
            this.datetime = new Date();
        }
        this.datetime.setHours(Number(hours));
        this.datetime.setMinutes(Number(minutes));
        this.datetime.setSeconds(0);
        this.datetime.setMilliseconds(0);
        this.emitValue();
    }

    dateChanged(date: MatDatepickerInputEvent<Date>) {
        const v = date.target.value || new Date();
        if (this.datetime) {
            this.datetime.setDate(v.getDate());
            this.datetime.setMonth(v.getMonth());
            this.datetime.setFullYear(v.getFullYear());
        } else {
            this.datetime = v;
        }
        this.emitValue();
    }

    validate(): ValidationErrors | null {
        return !this.datetime || isValid(this.datetime) ? null : { invalidDatetime: true };
    }

    private emitValue() {
        return this.emitOutgoingValue(getNoTimeZoneIsoString(this.datetime));
    }
}
