import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ValidationErrors } from '@angular/forms';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { coerceBoolean } from 'coerce-property';
import moment, { Moment } from 'moment';

import { createControlProviders } from '@cc/utils';

@Component({
    selector: 'cc-datetime',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, FlexModule],
    templateUrl: './datetime.component.html',
    providers: createControlProviders(DatetimeComponent),
})
export class DatetimeComponent extends FormComponentSuperclass<string> {
    @Input() label: string;
    @Input() @coerceBoolean required = false;
    @Input() hint?: string;

    datetime: Moment;

    get time() {
        return this.datetime ? this.datetime.format('HH:mm') : '';
    }

    handleIncomingValue(value: string) {
        this.datetime = value ? moment(value) : null;
    }

    timeChanged(event: Event) {
        const [hours, minutes] = (event.target as HTMLInputElement).value.split(':');
        this.datetime.set({ minutes: Number(minutes), hours: Number(hours) });
        this.emitOutgoingValue(this.datetime.toISOString());
    }

    dateChanged(date: MatDatepickerInputEvent<Moment>) {
        const v = date.target.value;
        if (!this.datetime) this.datetime = date.target.value;
        else this.datetime.set({ date: v.date(), month: v.month(), year: v.year() });
        this.emitOutgoingValue(this.datetime.toISOString());
    }

    validate(): ValidationErrors | null {
        return !this.datetime || this.datetime.isValid() ? null : { invalidDatetime: true };
    }
}
