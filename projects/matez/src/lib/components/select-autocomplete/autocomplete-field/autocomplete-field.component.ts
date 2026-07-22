import { isNil } from 'lodash-es';
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Input,
    booleanAttribute,
    inject,
    input,
    output,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import {
    FormControlSuperclass,
    createControlProviders,
    getValidValueChanges,
    getValueChanges,
} from '../../../utils';
import { Option } from '../types';
import { searchOptions } from '../utils';
import { getHintText } from '../utils/get-hint-text';

@Component({
    selector: 'v-autocomplete-field',
    templateUrl: './autocomplete-field.component.html',
    styleUrls: ['./autocomplete-field.component.scss'],
    providers: createControlProviders(() => AutocompleteFieldComponent),
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class AutocompleteFieldComponent<T> extends FormControlSuperclass<T> {
    private dr = inject(DestroyRef);

    options = input<Option<T>[]>([]);
    hint = input<string>(undefined);
    externalSearch = input<boolean>(false, { transform: booleanAttribute });
    searchChange = output<string>();
    requireSelection = input<boolean>(false, { transform: booleanAttribute });

    @Input() label?: string;
    @Input() error?: string;
    @Input() type: 'text' | 'number' = 'text';

    @Input({ transform: booleanAttribute }) mono = false;
    @Input({ transform: booleanAttribute }) required = false;

    hintText$ = combineLatest([
        getValidValueChanges(this.control),
        toObservable(this.options),
        toObservable(this.hint),
    ]).pipe(
        map(([value, options, hint]) => getHintText(options, [value], hint, { showLabel: true })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selected$ = combineLatest([getValueChanges(this.control), toObservable(this.options)]).pipe(
        map(([value, options]) => (options || []).find((o) => o.value === value)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    filteredOptions$ = combineLatest([
        getValueChanges(this.control).pipe(map((value) => String(value ?? '').toLowerCase())),
        toObservable(this.options),
    ]).pipe(
        map(([value, options]) => searchOptions(options, value)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    override ngOnInit(): void {
        super.ngOnInit();
        getValueChanges(this.control)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((value) => {
                this.searchChange.emit(String(value ?? ''));
            });
    }

    onBlur(): void {
        const value = this.control.value;
        const validValue = this.getValidValue(value);
        if (value !== validValue) {
            this.control.setValue(validValue);
        }
    }

    protected override innerToOuterValue(inner: T): T {
        return this.getValidValue(inner);
    }

    private getValidValue(value: T) {
        if (isNil(value)) {
            return value;
        }
        if (
            value === '' ||
            (this.requireSelection() &&
                !this.options().some((o) => String(o.value) === String(value)))
        ) {
            return undefined;
        }
        if (this.type === 'text') return value;
        const res = Number(value);
        if (isNaN(res)) return undefined;
        return res as T;
    }
}
