import {
    ChangeDetectionStrategy,
    Component,
    Input,
    booleanAttribute,
    input,
    model,
    output,
} from '@angular/core';
import {
    FormValueControl,
    disabled,
    form,
    required,
    transformedValue,
} from '@angular/forms/signals';
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

    @Input() label?: string;
    @Input() placeholder: string = '';
    @Input({ transform: (v: string) => (v === 'string' ? 'text' : v) })
    type: 'text' | 'number' | 'string' = 'text';
    @Input() appearance!: MatFormFieldAppearance;
    @Input() size?: 'small' | '';
    cleanButton = input(false, { transform: booleanAttribute });
    icon = input<string>();
    hintText = input<string>();

    private formValue = transformedValue<T, string | number>(this.value, {
        parse: (rawValue) => ({
            value: rawValue as T,
        }),
        format: (value) => {
            if (this.type === 'number') {
                return value ?? null;
            }
            return value ?? '';
        },
    });

    control = form<string | number>(this.formValue, (path) => {
        required(path, { when: () => this.required() });
        disabled(path, () => this.disabled());
    });
}
