import { Component, Input } from '@angular/core';
import { FormComponentSuperclass, provideValueAccessor } from '@s-libs/ng-core';
import { coerceBoolean } from 'coerce-property';

export interface Option<T> {
    label: string;
    value: T;
}

@Component({
    selector: 'cc-select',
    templateUrl: './select.component.html',
    providers: [provideValueAccessor(SelectComponent)],
})
export class SelectComponent<T> extends FormComponentSuperclass<T[]> {
    @Input() label: string;
    @Input() options: Option<T>[] = [];
    @Input() @coerceBoolean multiple = false;

    value: T[] = [];
    selectAllSymbol = Symbol();

    get valueWithSelectAllSymbol(): (T | symbol)[] {
        return this.isAllSelected ? [...this.value, this.selectAllSymbol] : this.value;
    }

    get isAllSelected() {
        return this.value.length === this.options.length;
    }

    get currentLabel() {
        return this.valueWithSelectAllSymbol.join(', ');
    }

    handleIncomingValue(value: T[]) {
        this.value = value || [];
    }

    change(value: (T | symbol)[]) {
        this.update(value.filter((v) => v !== this.selectAllSymbol) as T[]);
    }

    toggle() {
        this.update(this.isAllSelected ? [] : this.options.map((o) => o.value));
    }

    private update(value: T[]) {
        if (value.length !== this.value.length) {
            this.value = value;
            this.emitOutgoingValue(value);
        }
    }
}
