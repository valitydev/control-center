import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

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
    rows = model.required<T[][]>();
    cardTpl = contentChild.required<TemplateRef<{ $implicit: T }>>('card');
    isDragging = false;
    zoneData = [];

    dropInRow(event: CdkDragDrop<T[]>) {
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
        this.rows.set(rows.filter((r) => r.length > 0));
    }

    dropInZone(event: CdkDragDrop<T[]>, insertIndex: number) {
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
        this.rows.set(filtered);
    }
}
