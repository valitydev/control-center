import { Component, Input, Output, EventEmitter } from '@angular/core';
import { coerceBoolean } from 'coerce-property';

import { Schema } from './types/schema';

@Component({
    selector: 'cc-simple-table',
    templateUrl: './simple-table.component.html',
    styleUrls: ['./simple-table.component.scss'],
})
export class SimpleTableComponent<T> {
    @Input() data: T[];
    @Input() schema: Schema<T>;

    @Input() @coerceBoolean hasMore = false;
    @Input() @coerceBoolean inProgress = false;

    @Output() fetchMore = new EventEmitter<void>();
}
