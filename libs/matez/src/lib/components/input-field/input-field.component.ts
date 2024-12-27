import { Component, Input, input, booleanAttribute } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { createControlProviders, FormControlSuperclass } from '../../utils';

@Component({
    selector: 'v-input-field',
    templateUrl: './input-field.component.html',
    providers: createControlProviders(() => InputFieldComponent),
    styleUrl: 'input-field.component.scss',
})
export class InputFieldComponent<T> extends FormControlSuperclass<T> {
    @Input() label?: string;
    @Input() placeholder: string = '';
    @Input() type: 'string' | 'number' = 'string';
    @Input() appearance: MatFormFieldAppearance = 'fill';
    @Input() size?: 'small' | '';
    cleanButton = input(false, { transform: booleanAttribute });
    icon = input<string>();
}
