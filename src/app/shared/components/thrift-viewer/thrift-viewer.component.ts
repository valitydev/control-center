import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ReplaySubject } from 'rxjs';

import { objectToJSON } from '../../../api/utils';
import { toMonacoFile } from '../../../domain/utils';
import { ComponentChanges } from '../../utils';

export enum ViewerKind {
    Editor = 'editor',
    Component = 'component',
}

@UntilDestroy()
@Component({
    selector: 'cc-thrift-viewer',
    templateUrl: './thrift-viewer.component.html',
    styleUrls: ['./thrift-viewer.component.scss'],
})
export class ThriftViewerComponent<T> implements OnChanges {
    @Input() kind: ViewerKind = ViewerKind.Component;
    @Input() value: T;
    @Input() compared?: T;

    @Output() changeKind = new EventEmitter<ViewerKind>();

    valueFile$ = new ReplaySubject(1);
    comparedFile$ = new ReplaySubject(1);

    get isDiff() {
        return !!this.compared;
    }

    get json() {
        return objectToJSON(this.value);
    }

    ngOnChanges(changes: ComponentChanges<ThriftViewerComponent<T>>) {
        if (changes.value) {
            this.valueFile$.next(toMonacoFile(JSON.stringify(objectToJSON(this.value), null, 2)));
        }
        if (changes.compared) {
            this.comparedFile$.next(
                toMonacoFile(JSON.stringify(objectToJSON(this.compared), null, 2))
            );
        }
    }

    toggleKind() {
        switch (this.kind) {
            case ViewerKind.Editor:
                this.kind = ViewerKind.Component;
                break;
            case ViewerKind.Component:
                this.kind = ViewerKind.Editor;
                break;
        }
        this.changeKind.emit(this.kind);
    }
}
