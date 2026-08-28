import { isEqual } from 'lodash-es';

import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    forwardRef,
    input,
    model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { EventTypeTreeNode } from './types';
import { createEventTypesTree } from './utils/create-event-types-tree';

@Component({
    selector: 'cc-event-types-field',
    templateUrl: './event-types-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatCheckboxModule, MatButtonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EventTypesFieldComponent),
            multi: true,
        },
    ],
})
export class EventTypesFieldComponent<T = unknown>
    implements FormValueControl<T[]>, ControlValueAccessor
{
    structure = input.required<Record<string, unknown>>();
    disabled = model(false);
    value = model<T[]>([]);

    tree = computed<EventTypeTreeNode<T>[]>(() => createEventTypesTree<T>(this.structure()));
    allLeaves = computed<EventTypeTreeNode<T>[]>(() => this.tree().flatMap((node) => node.leaves));

    selectedLeafIds = computed<Set<string>>(() => {
        const selected = new Set<string>();
        const val = this.value();
        if (!val || val.length === 0) {
            return selected;
        }
        for (const leaf of this.allLeaves()) {
            if (val.some((item) => isEqual(item, leaf.eventType))) {
                selected.add(leaf.id);
            }
        }
        return selected;
    });

    private onChange: (val: T[]) => void = () => undefined;
    private onTouched: () => void = () => undefined;

    isChecked(node: EventTypeTreeNode<T>): boolean {
        const selected = this.selectedLeafIds();
        return node.leaves.length > 0 && node.leaves.every((leaf) => selected.has(leaf.id));
    }

    isIndeterminate(node: EventTypeTreeNode<T>): boolean {
        const selected = this.selectedLeafIds();
        const count = node.leaves.filter((leaf) => selected.has(leaf.id)).length;
        return count > 0 && count < node.leaves.length;
    }

    toggleNode(node: EventTypeTreeNode<T>, checked: boolean): void {
        const currentSelected = new Set(this.selectedLeafIds());
        for (const leaf of node.leaves) {
            if (checked) {
                currentSelected.add(leaf.id);
            } else {
                currentSelected.delete(leaf.id);
            }
        }
        const newTypes = this.allLeaves()
            .filter((leaf) => currentSelected.has(leaf.id))
            .map((leaf) => leaf.eventType!);
        this.updateValue(newTypes);
    }

    selectAll(): void {
        const allTypes = this.allLeaves().map((leaf) => leaf.eventType!);
        this.updateValue(allTypes);
    }

    clearAll(): void {
        this.updateValue([]);
    }

    writeValue(value: T[] | Set<T> | null): void {
        const array = value ? (Array.isArray(value) ? value : Array.from(value)) : [];
        this.value.set(array);
    }

    registerOnChange(fn: (val: T[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    private updateValue(val: T[]): void {
        this.value.set(val);
        this.onChange(val);
        this.onTouched();
    }
}
