import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, Output, EventEmitter, OnInit, ContentChild } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject } from 'rxjs';

import { SELECT_COLUMN_NAME } from '@cc/components/table';

import { SimpleTableActionsComponent } from './components/simple-table-actions.component';
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
    @Input() @coerceBoolean selectable = false;

    @Output() size = new EventEmitter<number>();
    @Output() update = new EventEmitter<{ size?: number }>();
    @Output() fetchMore = new EventEmitter<{ size?: number }>();
    @Output() selectionChange = new EventEmitter<SelectionModel<T>>();

    @ContentChild(SimpleTableActionsComponent) actions: SimpleTableActionsComponent;

    size$ = new BehaviorSubject<undefined | number>(25);

    get cols() {
        return this.selectable ? [SELECT_COLUMN_NAME, ...this.schema.list] : this.schema.list;
    }

    ngOnInit() {
        this.size$.pipe(untilDestroyed(this)).subscribe((v) => this.size.emit(v));
    }
}
