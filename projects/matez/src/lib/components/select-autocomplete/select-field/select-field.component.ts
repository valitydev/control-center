import { Component, EventEmitter, Input, OnInit, Output, booleanAttribute } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { timer, filter, take, first } from 'rxjs';

import { FormControlSuperclass, createControlProviders } from '../../../utils';
import { Option } from '../types';
import { isSearchOption } from '../utils';
import { getHintText } from '../utils/get-hint-text';

@Component({
    selector: 'v-select-field',
    templateUrl: './select-field.component.html',
    styleUrls: ['./select-field.component.scss'],
    providers: createControlProviders(() => SelectFieldComponent),
    standalone: false,
})
export class SelectFieldComponent<T = unknown>
    extends FormControlSuperclass<T[]>
    implements OnInit
{
    @Input() options: Option<T>[] = [];
    @Output() searchChange = new EventEmitter<string>();

    @Input() appearance!: MatFormFieldAppearance;

    @Input() label?: string;
    @Input() hint?: string;
    @Input() error?: string;
    @Input() progress = false;

    @Input({ transform: booleanAttribute }) externalSearch = false;
    @Input({ transform: booleanAttribute }) multiple = false;
    @Input({ transform: booleanAttribute }) required = false;

    @Input() size?: 'small' | '';

    searchStr: string = '';

    override ngOnInit() {
        super.ngOnInit();
        if (this.externalSearch) {
            timer(0)
                .pipe(first())
                .subscribe(() => {
                    this.searchChange.emit(String(this.control.value));
                });
        }
    }

    get hintText() {
        return getHintText(
            this.options,
            this.multiple ? this.control.value : [this.control.value as T],
            this.hint,
            {
                multiple: this.multiple,
            },
        );
    }

    search = (term: string, item: Option<T>) => {
        return this.externalSearch || isSearchOption(item, term.toLowerCase());
    };
}
