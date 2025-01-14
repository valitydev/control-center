import { Component, Input, OnChanges } from '@angular/core';
import { lowerFirst } from 'lodash-es';
import isNil from 'lodash-es/isNil';

import { ComponentChanges, FormControlSuperclass, createControlProviders } from '../../utils';

export interface State<T = unknown> {
    icon?: string;
    label?: string;
    value?: T;
}

@Component({
    selector: 'v-switch-button',
    templateUrl: './switch-button.component.html',
    styles: [],
    providers: createControlProviders(() => SwitchButtonComponent),
    standalone: false
})
export class SwitchButtonComponent<T = number>
    extends FormControlSuperclass<T>
    implements OnChanges
{
    @Input() states: State<T>[] = [];

    private hasChangeValue = false;

    get index() {
        return this.getIndex(this.control.value);
    }

    get nextIndex() {
        const nextIdx = this.index + 1;
        return nextIdx === this.states.length ? 0 : nextIdx;
    }

    get value(): T {
        return this.getValue(this.getIndex(this.control.value));
    }

    get state() {
        return this.states[this.index];
    }

    get nextState() {
        return this.states[this.nextIndex];
    }

    get tooltip() {
        const nextState = this.states[this.nextIndex];
        return nextState.label ? `Switch to ${lowerFirst(nextState.label)}` : '';
    }

    change() {
        this.control.setValue(this.getValue(this.nextIndex));
    }

    override ngOnChanges(changes: ComponentChanges<SwitchButtonComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.states && this.states.length) {
            if (!isNil(this.states?.[0]?.value)) {
                this.hasChangeValue = true;
            }
            if (isNil(this.control.value)) {
                this.control.setValue(this.value);
            }
        }
    }

    private getIndex(value: T) {
        return (
            (this.hasChangeValue
                ? this.states.findIndex((s) => s.value === value)
                : (value as number)) ?? 0
        );
    }

    private getValue(index: number) {
        return this.hasChangeValue ? (this.states[index]?.value as T) : (index as T);
    }
}
