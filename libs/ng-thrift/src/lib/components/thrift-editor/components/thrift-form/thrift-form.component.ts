import { Component, DestroyRef, HostBinding, Input, OnChanges, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validator } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';
import { Field, ValueType } from '@vality/thrift-ts';
import { BehaviorSubject, Observable, defer, switchMap } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { ThriftData } from '../../../../models';

import {
    MetadataFormExtension,
    MetadataFormExtensionResult,
    getExtensionsResult,
} from './types/metadata-form-extension';

@Component({
    selector: 'v-thrift-form',
    templateUrl: './thrift-form.component.html',
    styleUrl: `./thrift-form.component.scss`,
    providers: createControlProviders(() => ThriftFormComponent),
    standalone: false,
})
export class ThriftFormComponent<T>
    extends FormControlSuperclass<T>
    implements OnInit, OnChanges, Validator
{
    @Input() metadata!: ThriftAstMetadata[];
    @Input() namespace!: string;
    @Input() type!: ValueType;
    @Input() field?: Field;
    @Input() parent?: ThriftData;
    @Input() extensions?: MetadataFormExtension[];

    @HostBinding('class.v-thrift-form-hidden') hidden = false;

    data!: ThriftData;
    extensionResult$: Observable<MetadataFormExtensionResult> = defer(() => this.updated$).pipe(
        switchMap(() => getExtensionsResult(this.extensions, this.data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private updated$ = new BehaviorSubject<void>(undefined);

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    override ngOnInit() {
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

    override ngOnChanges() {
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
