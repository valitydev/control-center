import { Component, Input, Output, EventEmitter, OnInit, ContentChild } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { MtxGrid } from '@ng-matero/extensions/grid/grid';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject } from 'rxjs';

import { SimpleTableActionsComponent } from './components/simple-table-actions.component';

@UntilDestroy()
@Component({
    selector: 'cc-simple-table',
    templateUrl: './simple-table.component.html',
    styleUrls: ['./simple-table.component.scss'],
})
export class SimpleTableComponent<T> implements OnInit {
    @Input() data: T[];
    @Input() columns: MtxGridColumn[];
    @Input() cellTemplate?: MtxGrid['cellTemplate'];
    @Input() trackBy?: MtxGrid['trackBy'];
    @Input() @coerceBoolean loading = false;

    @Input() @coerceBoolean rowSelectable = false;
    @Output() rowSelectionChange = new EventEmitter<T[]>();

    @Input() @coerceBoolean hasMore = false;
    @Input() @coerceBoolean noUpdate = false;
    @Output() size = new EventEmitter<number>();
    @Output() update = new EventEmitter<{ size?: number }>();
    @Output() fetchMore = new EventEmitter<{ size?: number }>();

    @ContentChild(SimpleTableActionsComponent) actions: SimpleTableActionsComponent;

    size$ = new BehaviorSubject<undefined | number>(25);

    ngOnInit() {
        this.size$.pipe(untilDestroyed(this)).subscribe((v) => this.size.emit(v));
    }
}
