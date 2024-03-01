import { Input, Directive, OnChanges, booleanAttribute, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { FormControlSuperclass } from '@vality/ng-core';
import { ValueType } from '@vality/thrift-ts';
import { of, Observable, combineLatest, defer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { MetadataFormExtension } from '../../../metadata-form';

@Directive()
export abstract class BaseThriftFormSuperclass<T = unknown>
    extends FormControlSuperclass<T>
    implements OnChanges
{
    @Input() type: ValueType;
    @Input() namespace?: string;
    extensions = input<MetadataFormExtension[]>([]);
    @Input() defaultValue?: T;
    @Input({ transform: booleanAttribute }) noChangeKind = false;
    @Input({ transform: booleanAttribute }) noToolbar = false;

    protected abstract defaultNamespace: string;
    protected abstract metadata$: Observable<ThriftAstMetadata[]>;

    protected internalExtensions$: Observable<MetadataFormExtension[]> = of([]);
    protected extensions$ = combineLatest([
        defer(() => this.internalExtensions$),
        toObservable(this.extensions),
    ]).pipe(
        map((extGroups) => extGroups.flat()),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
}
