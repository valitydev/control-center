import { Sort } from '@angular/material/sort';

export interface DragDrop<T> {
    item: T;
    // Indexes in previous data
    previousIndex: number;
    currentIndex: number;
    previousData: T[];
    // Indexes in current data
    currentDataIndex: number;
    currentData: T[];

    sort: Sort;
}
