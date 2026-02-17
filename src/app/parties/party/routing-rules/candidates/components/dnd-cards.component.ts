import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

@Component({
    selector: 'cc-dnd-cards',
    templateUrl: 'dnd-cards.component.html',
    styleUrl: 'dnd-cards.component.css',
    imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class DndCardsComponent {
    rows: string[][] = [
        ['Zero', 'One'],
        ['Two'],
        ['Three'],
        ['Four', 'Five'],
        ['Six', 'Seven', 'Eight', 'Nine'],
    ];
    readonly zoneData: string[][] = Array.from({ length: 30 }, (): string[] => []);
    isDragging = false;

    dropInRow(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
            this.rows = this.rows.filter((r) => r.length > 0);
        }
    }

    dropInZone(event: CdkDragDrop<string[]>, insertIndex: number) {
        const source = event.previousContainer.data;
        const [item] = source.splice(event.previousIndex, 1);
        const sourceRowIndex = this.rows.indexOf(source);
        let adjusted = insertIndex;
        if (source.length === 0 && sourceRowIndex !== -1 && sourceRowIndex < insertIndex) {
            adjusted--;
        }
        this.rows = this.rows.filter((r) => r.length > 0);
        this.rows.splice(adjusted, 0, [item]);
    }
}
