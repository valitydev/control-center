import { Component, DestroyRef, Input, OnChanges, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ValidationErrors, Validator, Validators } from '@angular/forms';
import { ComponentChanges, FormComponentSuperclass, createControlProviders } from '@vality/matez';
import { ThriftType } from '@vality/thrift-ts';
import { Observable, ReplaySubject, combineLatest, defer, switchMap } from 'rxjs';
import { first, map, shareReplay } from 'rxjs/operators';

import { ThriftData, getAliases } from '../../../../../../models';
import { getValueTypeTitle } from '../../../../../../utils';
import {
    Converter,
    MetadataFormExtension,
    MetadataFormExtensionResult,
    getExtensionsResult,
} from '../../types/metadata-form-extension';

@Component({
    selector: 'v-extension-field',
    templateUrl: './extension-field.component.html',
    providers: createControlProviders(() => ExtensionFieldComponent),
    standalone: false,
})
export class ExtensionFieldComponent<T>
    extends FormComponentSuperclass<T>
    implements Validator, OnChanges, OnInit
{
    @Input() data!: ThriftData<ThriftType>;
    @Input() extensions?: MetadataFormExtension[];

    control = new FormControl<T>(null as T);

    extensionResult$: Observable<MetadataFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(
        map((v) => v?.generate as NonNullable<MetadataFormExtensionResult['generate']>),
    );

    get aliases() {
        return [...getAliases(this.data), ...(this.data.field ? [this.data] : [])]
            .filter((d) => d.typeGroup !== 'primitive')
            .map((d) => getValueTypeTitle(d.type))
            .filter((t) => t !== this.data.field?.name)
            .join(', ');
    }

    private data$ = new ReplaySubject<ThriftData>(1);
    private extensions$ = new ReplaySubject<MetadataFormExtension[]>(1);
    private converter$: Observable<Converter> = this.extensionResult$.pipe(
        map(
            ({ converter }) =>
                converter || {
                    outputToInternal: (v: unknown) => v,
                    internalToOutput: (v: unknown) => v,
                },
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    override ngOnInit() {
        this.control.valueChanges
            .pipe(
                switchMap(() => this.converter$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((converter) => {
                this.emitOutgoingValue(converter.internalToOutput(this.control.value) as never);
            });
    }

    handleIncomingValue(value: T) {
        this.converter$
            .pipe(first(), takeUntilDestroyed(this.destroyRef))
            .subscribe((converter) => {
                this.control.setValue(converter.outputToInternal(value) as never);
            });
    }

    override validate(): ValidationErrors | null {
        return null;
    }

    override ngOnChanges(changes: ComponentChanges<ExtensionFieldComponent<T>>) {
        if (changes.data) {
            this.data$.next(this.data);
            this.control.setValidators(this.data.isRequired ? Validators.required : []);
        }
        if (changes.extensions) {
            this.extensions$.next(this.extensions as MetadataFormExtension[]);
        }
    }

    generate(event: MouseEvent) {
        this.generate$
            .pipe(
                switchMap((generate) => generate()),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => this.control.setValue(value as T));
        event.stopPropagation();
    }

    clear(event: MouseEvent) {
        this.control.reset(null as T);
        event.stopPropagation();
    }
}
