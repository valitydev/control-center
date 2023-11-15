import { Component, Input, OnChanges, Output, EventEmitter, booleanAttribute } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { ComponentChanges } from '@vality/ng-core';
import { ValueType } from '@vality/thrift-ts';
import { ReplaySubject } from 'rxjs';

import { MetadataViewExtension } from '@cc/app/shared/components/json-viewer';
import { objectToJSON } from '@cc/utils/thrift-instance';

import { MonacoFile } from '../../../../components/monaco-editor';
import { toMonacoFile } from '../../../sections/domain/utils';

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
    @Input({ transform: booleanAttribute }) progress: boolean = false;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() extensions?: MetadataViewExtension[];

    @Output() changeKind = new EventEmitter<ViewerKind>();

    valueFile$ = new ReplaySubject<MonacoFile>(1);
    comparedFile$ = new ReplaySubject<MonacoFile>(1);

    get isDiff() {
        return !!this.compared;
    }

    ngOnChanges(changes: ComponentChanges<ThriftViewerComponent<T>>) {
        if (changes.value) {
            this.valueFile$.next(toMonacoFile(JSON.stringify(objectToJSON(this.value), null, 2)));
        }
        if (changes.compared) {
            this.comparedFile$.next(
                toMonacoFile(JSON.stringify(objectToJSON(this.compared), null, 2)),
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
