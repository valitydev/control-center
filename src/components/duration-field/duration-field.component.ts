import { CommonModule } from '@angular/common';
import { Component, Input, model } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, FormValueControl, form } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { LifetimeInterval } from '@vality/domain-proto/domain';
import { InputFieldModule, Option, SelectFieldModule } from '@vality/matez';

type DurationUnit = keyof LifetimeInterval;

export interface Duration {
    amount: number;
    unit: DurationUnit;
}

@Component({
    selector: 'cc-duration-field',
    templateUrl: './duration-field.component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        InputFieldModule,
        SelectFieldModule,
        FormField,
    ],
})
export class DurationFieldComponent implements FormValueControl<Duration> {
    @Input() label = 'Duration';

    unitOptions: Option<string>[] = [
        { value: 'seconds', label: 'Seconds' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' },
    ];
    value = model<Duration>({ amount: 1, unit: 'hours' });
    control = form(this.value);
}
