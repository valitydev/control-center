import { Component, Input, OnChanges, HostBinding, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validator } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { createControlProviders, FormControlSuperclass } from '@vality/ng-core';
import { Field, ValueType } from '@vality/thrift-ts';
import { Observable, BehaviorSubject, defer, switchMap } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';

import {
    MetadataFormExtension,
    MetadataFormExtensionResult,
    getExtensionsResult,
} from './types/metadata-form-extension';
import { ThriftData } from './types/thrift-data';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './thrift-form.component.html',
    styleUrl: `./thrift-form.component.scss`,
    providers: createControlProviders(() => ThriftFormComponent),
})
export class ThriftFormComponent<T>
    extends FormControlSuperclass<T>
    implements OnInit, OnChanges, Validator
{
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: ThriftData;
    @Input() extensions?: MetadataFormExtension[];

    @HostBinding('class.cc-metadata-form-hidden') hidden = false;

    data: ThriftData;
    extensionResult$: Observable<MetadataFormExtensionResult> = defer(() => this.updated$).pipe(
        switchMap(() => getExtensionsResult(this.extensions, this.data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private updated$ = new BehaviorSubject<void>(undefined);

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        this.extensionResult$
            .pipe(
                map((res) => res?.hidden),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((hidden) => {
                this.hidden = hidden;
            });
    }

    ngOnChanges() {
        if (this.metadata && this.namespace && this.type) {
            try {
                this.data = new ThriftData(
                    this.metadata,
                    this.namespace,
                    this.type,
                    this.field,
                    this.parent,
                );
                this.updated$.next(undefined);
            } catch (err) {
                this.data = undefined;
                console.warn(err);
            }
        }
    }
}
