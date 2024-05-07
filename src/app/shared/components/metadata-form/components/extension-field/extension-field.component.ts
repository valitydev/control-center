import { Component, Input, OnChanges, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validator, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { FormComponentSuperclass, ComponentChanges, createControlProviders } from '@vality/ng-core';
import { getValueTypeTitle } from '@vality/ng-thrift';
import { ThriftType } from '@vality/thrift-ts';
import { defer, switchMap, ReplaySubject, Observable, combineLatest } from 'rxjs';
import { shareReplay, first, map, pluck } from 'rxjs/operators';

import {
    Converter,
    MetadataFormExtension,
    MetadataFormExtensionResult,
    getExtensionsResult,
} from '../../types/metadata-form-extension';
import { getAliases, ThriftData } from '../../types/thrift-data';

@Component({
    selector: 'cc-extension-field',
    templateUrl: './extension-field.component.html',
    providers: createControlProviders(() => ExtensionFieldComponent),
})
export class ExtensionFieldComponent<T>
    extends FormComponentSuperclass<T>
    implements Validator, OnChanges, OnInit
{
    @Input() data: ThriftData<ThriftType>;
    @Input() extensions: MetadataFormExtension[];

    control = new FormControl<T>(null);

    extensionResult$: Observable<MetadataFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(pluck('generate'));

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

    ngOnInit() {
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

    validate(): ValidationErrors | null {
        return null;
    }

    ngOnChanges(changes: ComponentChanges<ExtensionFieldComponent<T>>) {
        if (changes.data) {
            this.data$.next(this.data);
            this.control.setValidators(this.data.isRequired ? Validators.required : []);
        }
        if (changes.extensions) {
            this.extensions$.next(this.extensions);
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
        this.control.reset(null);
        event.stopPropagation();
    }
}
