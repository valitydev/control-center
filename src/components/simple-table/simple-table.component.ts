import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject } from 'rxjs';

import { Schema } from './types/schema';

@UntilDestroy()
@Component({
    selector: 'cc-simple-table',
    templateUrl: './simple-table.component.html',
    styleUrls: ['./simple-table.component.scss'],
})
export class SimpleTableComponent<T> implements OnInit {
    @Input() data: T[];
    @Input() schema: Schema<T>;

    @Input() @coerceBoolean hasMore = false;
    @Input() @coerceBoolean inProgress = false;
    @Input() @coerceBoolean noUpdate = false;

    @Output() size = new EventEmitter<number>();
    @Output() update = new EventEmitter<{ size?: number }>();
    @Output() fetchMore = new EventEmitter<{ size?: number }>();

    size$ = new BehaviorSubject<undefined | number>(25);

    ngOnInit() {
        this.size$.pipe(untilDestroyed(this)).subscribe((v) => this.size.emit(v));
    }
}
