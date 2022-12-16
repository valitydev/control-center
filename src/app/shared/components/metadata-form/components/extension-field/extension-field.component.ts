import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Validator, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { ThriftType } from '@vality/thrift-ts';
import { defer, switchMap, ReplaySubject, Observable, combineLatest } from 'rxjs';
import { shareReplay, first, map, pluck } from 'rxjs/operators';

import { getValueTypeTitle } from '@cc/app/shared/pipes';
import { createControlProviders } from '@cc/utils';

import { ComponentChanges } from '../../../../utils';
import { getAliases, MetadataFormData } from '../../types/metadata-form-data';
import {
    Converter,
    MetadataFormExtension,
    MetadataFormExtensionResult,
    getFirstDeterminedExtensionsResult,
} from '../../types/metadata-form-extension';

@UntilDestroy()
@Component({
    selector: 'cc-extension-field',
    templateUrl: './extension-field.component.html',
    providers: createControlProviders(() => ExtensionFieldComponent),
})
export class ExtensionFieldComponent<T>
    extends FormComponentSuperclass<T>
    implements Validator, OnChanges, OnInit
{
    @Input() data: MetadataFormData<ThriftType>;
    @Input() extensions: MetadataFormExtension[];

    control = new FormControl<T>(null);

    extensionResult$: Observable<MetadataFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getFirstDeterminedExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    generate$ = this.extensionResult$.pipe(pluck('generate'));

    get aliases() {
        return [...getAliases(this.data), ...(this.data.field ? [this.data] : [])]
            .filter((d) => d.typeGroup !== 'primitive')
            .map((d) => getValueTypeTitle(d.type))
            .filter((t) => t !== this.data.field?.name)
            .join(', ');
    }

    private data$ = new ReplaySubject<MetadataFormData>(1);
    private extensions$ = new ReplaySubject<MetadataFormExtension[]>(1);
    private converter$: Observable<Converter> = this.extensionResult$.pipe(
        map(
            ({ converter }) =>
                converter || {
                    outputToInternal: (v: unknown) => v,
                    internalToOutput: (v: unknown) => v,
                }
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    ngOnInit() {
        this.control.valueChanges
            .pipe(
                switchMap(() => this.converter$),
                untilDestroyed(this)
            )
            .subscribe((converter) => {
                this.emitOutgoingValue(converter.internalToOutput(this.control.value) as never);
            });
    }

    handleIncomingValue(value: T) {
        this.converter$.pipe(first(), untilDestroyed(this)).subscribe((converter) => {
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
        if (changes.extensions) this.extensions$.next(this.extensions);
    }

    generate(event: MouseEvent) {
        this.generate$
            .pipe(
                switchMap((generate) => generate()),
                untilDestroyed(this)
            )
            .subscribe((value) => this.control.setValue(value as T));
        event.stopPropagation();
    }

    clear(event: MouseEvent) {
        this.control.reset(null);
        event.stopPropagation();
    }
}
