import {
    ChangeDetectionStrategy,
    Component,
    Input,
    booleanAttribute,
    input,
    model,
    output,
} from '@angular/core';
import { FormValueControl, disabled, form, required } from '@angular/forms/signals';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
    selector: 'v-input-field',
    templateUrl: './input-field.component.html',
    styleUrl: 'input-field.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class InputFieldComponent<
    T extends string | number = string,
> implements FormValueControl<T> {
    value = model<T>();
    disabled = input(false);
    required = input(false, { transform: booleanAttribute });
    touch = output<void>();
    control = form<string | number>(this.value, (path) => {
        required(path, { when: () => this.required() });
        disabled(path, () => this.disabled());
    });
    @Input() label?: string;
    @Input() placeholder: string = '';
    @Input() type: 'string' | 'number' = 'string';
    @Input() appearance!: MatFormFieldAppearance;
    @Input() size?: 'small' | '';
    cleanButton = input(false, { transform: booleanAttribute });
    icon = input<string>();
    hintText = input<string>();
}
