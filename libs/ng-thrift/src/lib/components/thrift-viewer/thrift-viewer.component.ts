import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    booleanAttribute,
    computed,
    input,
} from '@angular/core';
import { ComponentChanges, UnionEnum } from '@vality/matez';
import { ValueType } from '@vality/thrift-ts';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { ReplaySubject } from 'rxjs';

import { ThriftData } from '../../models';
import { ThriftAstMetadata } from '../../types';
import { toJson } from '../../utils';

import { ThriftViewData } from './models/thrift-view-data';
import { ThriftViewExtension } from './utils/thrift-view-extension';

export enum ViewerKind {
    Editor = 'editor',
    Component = 'component',
}

@Component({
    selector: 'v-thrift-viewer',
    templateUrl: './thrift-viewer.component.html',
    styleUrls: ['./thrift-viewer.component.scss'],
    standalone: false,
})
export class ThriftViewerComponent<T> implements OnChanges {
    @Input() kind: UnionEnum<ViewerKind> = ViewerKind.Component;
    readonly value = input.required<T>();
    @Input() compared?: T;
    @Input({ transform: booleanAttribute }) progress: boolean = false;

    readonly metadata = input<ThriftAstMetadata[]>();
    readonly namespace = input<string>();
    readonly type = input<ValueType>();
    readonly extensions = input<ThriftViewExtension[]>();

    @Output() changeKind = new EventEmitter<ViewerKind>();

    valueFile$ = new ReplaySubject<DiffEditorModel>(1);
    comparedFile$ = new ReplaySubject<DiffEditorModel>(1);
    view = computed(() => {
        const metadata = this.metadata();
        const namespace = this.namespace();
        const type = this.type();
        if (metadata && namespace && type) {
            const data = new ThriftData(metadata, namespace, type);
            return new ThriftViewData(this.value(), undefined, data, this.extensions());
        }
        return new ThriftViewData(this.value(), undefined, undefined, this.extensions());
    });

    get isDiff() {
        return !!this.compared;
    }

    ngOnChanges(changes: ComponentChanges<ThriftViewerComponent<T>>) {
        if (changes.value) {
            this.valueFile$.next({
                code: JSON.stringify(toJson(this.value()), null, 2),
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
