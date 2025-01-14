import { Component, Input, OnChanges, booleanAttribute } from '@angular/core';
import { BehaviorSubject, merge } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ComponentChanges, FormControlSuperclass, createControlProviders } from '../../../utils';
import { Option } from '../types';
import { searchOptions } from '../utils';
import { getHintText } from '../utils/get-hint-text';

@Component({
    selector: 'v-autocomplete-field',
    templateUrl: './autocomplete-field.component.html',
    styleUrls: ['./autocomplete-field.component.scss'],
    providers: createControlProviders(() => AutocompleteFieldComponent),
    standalone: false
})
export class AutocompleteFieldComponent<T> extends FormControlSuperclass<T> implements OnChanges {
    @Input() options: Option<T>[] = [];

    @Input() label?: string;
    @Input() hint?: string;
    @Input() error?: string;
    @Input() type = 'text';

    @Input({ transform: booleanAttribute }) mono = false;
    @Input({ transform: booleanAttribute }) required = false;

    get hintText() {
        return getHintText(this.options, [this.control.value], this.hint, { showLabel: true });
    }

    options$ = new BehaviorSubject<Option<T>[]>([]);
    selected$ = merge(this.control.valueChanges, this.options$).pipe(
        map(() => (this.options || []).find((o) => o.value === this.control.value)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    filteredOptions$ = merge(this.control.valueChanges, this.options$).pipe(
        map(() => String(this.control.value ?? '').toLowerCase()),
        map((filter) => searchOptions(this.options, filter)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    override ngOnChanges(changes: ComponentChanges<AutocompleteFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.options) {
            this.options$.next(this.options || []);
        }
    }
}
