import { Component, Input } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';

import {
    FormControlSuperclass,
    createControlProviders,
    getValueChanges,
    splitBySeparators,
} from '../../utils';

@Component({
    selector: 'v-list-field',
    templateUrl: './list-field.component.html',
    providers: createControlProviders(() => ListFieldComponent),
})
export class ListFieldComponent extends FormControlSuperclass<string[], string> {
    @Input() label?: string;
    @Input() focusedHint?: string;

    items$ = getValueChanges(this.control).pipe(
        map((v) => this.getValue(v)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    protected override innerToOuterValue(inner: string): string[] {
        return this.getValue(inner);
    }

    protected override outerToInnerValue(outer: string[]): string {
        return (outer || []).join(', ');
    }

    private getValue(inner: string = this.control.value) {
        return splitBySeparators(inner || '');
    }
}
