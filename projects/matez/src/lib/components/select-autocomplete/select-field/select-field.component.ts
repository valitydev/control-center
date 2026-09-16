import { first, timer } from 'rxjs';

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
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
import { MtxSelect } from '@ng-matero/extensions/select';

import { Option } from '../types';
import { isSearchOption } from '../utils';
import { getHintText } from '../utils/get-hint-text';

@Component({
    selector: 'v-select-field',
    templateUrl: './select-field.component.html',
    styleUrls: ['./select-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class SelectFieldComponent<T = unknown> implements FormValueControl<T | T[]>, OnInit {
    value = model<T | T[]>();
    disabled = input(false);
    touch = output<void>();
    selection = transformedValue<T | T[], T | T[]>(this.value, {
        parse: (value) => ({ value }),
        format: (value) => (value === '' ? undefined : value),
    });
    control = form<unknown>(this.selection, (path) => {
        required(path, { when: () => this.required() });
        disabled(path, () => this.disabled());
    });

    @Input() options: Option<T>[] = [];
    search = model<string>('');

    @Input() appearance!: MatFormFieldAppearance;

    @Input() label?: string;
    @Input() hint?: string;
    @Input() placeholder?: string;
    @Input() error?: string;
    @Input() progress = false;
    @Input({ transform: booleanAttribute }) clearable = true;

    @Input({ transform: booleanAttribute }) externalSearch = false;
    @Input({ transform: booleanAttribute }) multiple = false;
    required = input(false, { transform: booleanAttribute });

    @Input() size?: 'small' | '';

    ngOnInit() {
        if (this.externalSearch) {
            timer(0)
                .pipe(first())
                .subscribe(() => {
                    this.search.set(String(this.selection() ?? ''));
                });
        }
    }

    get hintText() {
        return getHintText(
            this.options,
            this.multiple ? (this.selection() as T[]) : [this.selection() as T],
            this.hint,
            {
                multiple: this.multiple,
            },
        );
    }

    searchFn = (term: string, item: Option<T>) => {
        return this.externalSearch || isSearchOption(item, term.toLowerCase());
    };

    // TODO: close not working for mouse click
    close(select: MtxSelect) {
        if (!this.multiple) {
            timer(0)
                .pipe(first())
                .subscribe(() => select.close());
        }
    }
}
