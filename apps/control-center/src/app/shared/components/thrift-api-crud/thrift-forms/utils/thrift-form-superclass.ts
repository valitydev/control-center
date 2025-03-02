import { Directive, Input, OnChanges, booleanAttribute, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { FormControlSuperclass, UnionEnum } from '@vality/matez';
import { EditorKind, ThriftFormExtension } from '@vality/ng-thrift';
import { ValueType } from '@vality/thrift-ts';
import { Observable, combineLatest, defer, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Directive()
export abstract class BaseThriftFormSuperclass<T = unknown>
    extends FormControlSuperclass<T>
    implements OnChanges
{
    @Input() type: ValueType;
    @Input() namespace?: string;
    extensions = input<ThriftFormExtension[]>([]);
    @Input() defaultValue?: T;
    @Input({ transform: booleanAttribute }) noChangeKind = false;
    @Input({ transform: booleanAttribute }) noToolbar = false;
    kind = model<UnionEnum<EditorKind>>(EditorKind.Form);

    protected abstract defaultNamespace: string;
    protected abstract metadata$: Observable<ThriftAstMetadata[]>;

    protected internalExtensions$: Observable<ThriftFormExtension[]> = of([]);
    protected extensions$ = combineLatest([
        defer(() => this.internalExtensions$),
        toObservable(this.extensions),
    ]).pipe(
        map((extGroups) => extGroups.flat()),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
}
