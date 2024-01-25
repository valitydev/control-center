import { Input, Directive, OnChanges } from '@angular/core';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { FormControlSuperclass, ComponentChanges } from '@vality/ng-core';
import { ValueType } from '@vality/thrift-ts';
import { of, Observable, BehaviorSubject, combineLatest, defer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { MetadataFormExtension } from '../../../metadata-form';

@Directive()
export abstract class BaseThriftFormSuperclass<T = unknown>
    extends FormControlSuperclass<T>
    implements OnChanges
{
    @Input() type: ValueType;
    @Input() namespace?: string;
    @Input() extensions?: MetadataFormExtension[];
    @Input() defaultValue?: T;

    protected abstract defaultNamespace: string;
    protected abstract metadata$: Observable<ThriftAstMetadata[]>;

    protected internalExtensions$: Observable<MetadataFormExtension[]> = of([]);
    protected externalExtensions$ = new BehaviorSubject<MetadataFormExtension[]>([]);
    protected extensions$ = combineLatest([
        defer(() => this.internalExtensions$),
        this.externalExtensions$,
    ]).pipe(
        map(([internal, external]) => [...internal, ...external]),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    ngOnChanges(changes: ComponentChanges<BaseThriftFormSuperclass>) {
        super.ngOnChanges(changes);
        if (changes.extensions) {
            this.externalExtensions$.next(changes.extensions.currentValue);
        }
    }
}
