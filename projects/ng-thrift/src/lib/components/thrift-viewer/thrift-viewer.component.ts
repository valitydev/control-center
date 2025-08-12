import { Component, booleanAttribute, computed, input, model } from '@angular/core';

import { UnionEnum } from '@vality/matez';
import { ValueType } from '@vality/thrift-ts';

import { ThriftData } from '../../models';
import { ThriftAstMetadata } from '../../types';

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
export class ThriftViewerComponent {
    readonly kind = model<UnionEnum<ViewerKind>>(ViewerKind.Component);
    readonly value = input.required();
    readonly compared = input();
    readonly progress = input<boolean, unknown>(false, { transform: booleanAttribute });
    readonly metadata = input<ThriftAstMetadata[]>();
    readonly namespace = input<string>();
    readonly type = input<ValueType>();
    readonly extensions = input<ThriftViewExtension[]>();

    isDiff = computed(() => !!this.compared());
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

    toggleKind() {
        const kind = this.kind();
        switch (kind) {
            case ViewerKind.Editor:
                this.kind.set(ViewerKind.Component);
                break;
            case ViewerKind.Component:
                this.kind.set(ViewerKind.Editor);
                break;
        }
    }
}
