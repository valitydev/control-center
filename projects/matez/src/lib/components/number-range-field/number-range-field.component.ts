import { Component, Input, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';

import { FormGroupSuperclass, createControlProviders } from '../../utils';

export interface NumberRange {
    start?: number;
    end?: number;
}

@Component({
    selector: 'v-number-range-field',
    templateUrl: './number-range-field.component.html',
    styleUrls: ['./number-range-field.component.scss'],
    providers: createControlProviders(() => NumberRangeFieldComponent),
    standalone: false,
})
export class NumberRangeFieldComponent extends FormGroupSuperclass<NumberRange> {
    private fb = inject(NonNullableFormBuilder);
    @Input() label!: string;

    control = this.fb.group<NumberRange>({
        start: undefined,
        end: undefined,
    });
}
