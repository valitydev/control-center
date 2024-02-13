import { Component, Input, OnChanges, HostBinding, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validator } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { createControlProviders, FormControlSuperclass } from '@vality/ng-core';
import { Field, ValueType } from '@vality/thrift-ts';
import { Observable, BehaviorSubject, defer, switchMap } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';

import { MetadataFormData } from './types/metadata-form-data';
import {
    MetadataFormExtension,
    MetadataFormExtensionResult,
    getFirstDeterminedExtensionsResult,
} from './types/metadata-form-extension';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './metadata-form.component.html',
    styleUrl: `./metadata-form.component.scss`,
    providers: createControlProviders(() => MetadataFormComponent),
})
export class MetadataFormComponent<T>
    extends FormControlSuperclass<T>
    implements OnInit, OnChanges, Validator
{
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;
    @Input() extensions?: MetadataFormExtension[];

    @HostBinding('class.cc-metadata-form-hidden') hidden = false;

    data: MetadataFormData;
    extensionResult$: Observable<MetadataFormExtensionResult> = defer(() => this.updated$).pipe(
        switchMap(() => getFirstDeterminedExtensionsResult(this.extensions, this.data)),
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
                this.data = new MetadataFormData(
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
