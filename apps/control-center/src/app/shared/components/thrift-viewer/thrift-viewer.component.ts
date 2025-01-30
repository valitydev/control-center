import { Component, EventEmitter, Input, OnChanges, Output, booleanAttribute } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { ComponentChanges, UnionEnum } from '@vality/matez';
import { MetadataViewExtension, toJson } from '@vality/ng-thrift';
import { ValueType } from '@vality/thrift-ts';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { ReplaySubject } from 'rxjs';

export enum ViewerKind {
    Editor = 'editor',
    Component = 'component',
}

@Component({
    selector: 'cc-thrift-viewer',
    templateUrl: './thrift-viewer.component.html',
    styleUrls: ['./thrift-viewer.component.scss'],
    standalone: false,
})
export class ThriftViewerComponent<T> implements OnChanges {
    @Input() kind: UnionEnum<ViewerKind> = ViewerKind.Component;
    @Input() value: T;
    @Input() compared?: T;
    @Input({ transform: booleanAttribute }) progress: boolean = false;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() extensions?: MetadataViewExtension[];

    @Output() changeKind = new EventEmitter<ViewerKind>();

    valueFile$ = new ReplaySubject<DiffEditorModel>(1);
    comparedFile$ = new ReplaySubject<DiffEditorModel>(1);

    get isDiff() {
        return !!this.compared;
    }

    ngOnChanges(changes: ComponentChanges<ThriftViewerComponent<T>>) {
        if (changes.value) {
            this.valueFile$.next({
                code: JSON.stringify(toJson(this.value), null, 2),
                language: 'json',
            });
        }
        if (changes.compared) {
            this.comparedFile$.next({
                code: JSON.stringify(toJson(this.compared), null, 2),
                language: 'json',
            });
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
        this.changeKind.emit(this.kind as ViewerKind);
    }
}
