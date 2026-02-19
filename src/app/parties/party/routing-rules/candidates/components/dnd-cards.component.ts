import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
    Component,
    TemplateRef,
    contentChild,
    effect,
    model,
    output,
    untracked,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export interface Item<T> {
    value: T;
    width?: number;
    disabled?: boolean;
}

@Component({
    selector: 'cc-dnd-cards',
    templateUrl: 'dnd-cards.component.html',
    styleUrl: 'dnd-cards.component.scss',
    imports: [
        CommonModule,
        NgTemplateOutlet,
        CdkDropListGroup,
        CdkDropList,
        CdkDrag,
        MatCardModule,
    ],
})
export class DndCardsComponent<T = unknown> {
    rows = model.required<Item<T>[][]>();
    cardTpl = contentChild.required<TemplateRef<{ $implicit: T }>>('card');
    isDragging = false;
    zoneData: Item<T>[] = [];
    dropped = output<Item<T>[][]>();

    constructor() {
        effect(() => {
            const rows = this.rows();
            const sorted = rows.map((r) => this.sortRow(r));
            const changed = sorted.some((r, i) => r.some((item, j) => item !== rows[i][j]));
            if (changed) untracked(() => this.rows.set(sorted));
        });
    }

    dropInRow(event: CdkDragDrop<Item<T>[]>) {
        const rows = this.rows();
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
        this.rows.set(rows.filter((r) => r.length > 0).map((r) => this.sortRow(r)));
        this.drop();
    }

    dropInZone(event: CdkDragDrop<Item<T>[]>, insertIndex: number) {
        const rows = this.rows();
        const source = event.previousContainer.data;
        const [item] = source.splice(event.previousIndex, 1);
        const sourceRowIndex = rows.indexOf(source);
        let adjusted = insertIndex;
        if (source.length === 0 && sourceRowIndex !== -1 && sourceRowIndex < insertIndex) {
            adjusted--;
        }
        const filtered = rows.filter((r) => r.length > 0);
        filtered.splice(adjusted, 0, [item]);
        this.rows.set(filtered.map((r) => this.sortRow(r)));
        this.drop();
    }

    drop() {
        this.dropped.emit(this.rows());
    }

    private sortRow(row: Item<T>[]): Item<T>[] {
        return [...row].sort((a, b) => {
            if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
            return (b.width ?? 0) - (a.width ?? 0);
        });
    }
}
