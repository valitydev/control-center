import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    Input,
    OnChanges,
    booleanAttribute,
    input,
    signal,
} from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { ThriftViewExtension, ViewerKind } from '@vality/ng-thrift';
import { ValueType } from '@vality/thrift-ts';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface Data<T> {
    kind: ViewerKind;
    value: T;
    compared?: T;
    type: ValueType;
    progress: boolean;
    namespace: string;
    metadata$: Observable<ThriftAstMetadata[]>;
    extensions$: Observable<ThriftViewExtension[]>;
}

@Component({
    selector: 'cc-thrift-viewer-base',
    templateUrl: './thrift-viewer-base.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class ThriftViewerBaseComponent<T> {
    data = input.required<Data<T>>();
}

@Directive()
export abstract class ThriftViewerSuperclass<T> implements OnChanges {
    @Input() kind = ViewerKind.Component;
    @Input() value: T;
    @Input() compared?: T;
    @Input() type: ValueType;
    @Input({ transform: booleanAttribute }) progress = false;
    @Input() extensions: ThriftViewExtension[] = [];
    @Input() namespace?: string;

    abstract defaultNamespace: string;
    abstract metadata$: Observable<ThriftAstMetadata[]>;
    extensions$: Observable<ThriftViewExtension[]> = of([]);

    data = signal<Data<T>>(this.createData());

    ngOnChanges() {
        this.data.set(this.createData());
    }

    private createData() {
        return {
            kind: this.kind,
            value: this.value,
            compared: this.compared,
            type: this.type,
            progress: this.progress,
            namespace: this.namespace || this.defaultNamespace,
            metadata$: this.metadata$,
            extensions$: this.extensions$.pipe(
                map((ext) => [...(ext || []), ...(this.extensions || [])]),
                shareReplay({ refCount: true, bufferSize: 1 }),
            ),
        };
    }
}
