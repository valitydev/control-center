import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Validator, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { ThriftType } from '@vality/thrift-ts';
import { defer, switchMap, ReplaySubject, Observable } from 'rxjs';
import { shareReplay, first, map } from 'rxjs/operators';

import { createControlProviders } from '@cc/utils';

import { ComponentChanges } from '../../../../utils';
import { MetadataFormData } from '../../types/metadata-form-data';
import { Converter } from '../../types/metadata-form-extension';

@UntilDestroy()
@Component({
    selector: 'cc-extension-field',
    templateUrl: './extension-field.component.html',
    providers: createControlProviders(ExtensionFieldComponent),
})
export class ExtensionFieldComponent<T>
    extends FormComponentSuperclass<T>
    implements Validator, OnChanges, OnInit
{
    @Input() data: MetadataFormData<ThriftType>;

    control = new FormControl<T>(null);

    extensionResult$ = defer(() => this.data$).pipe(
        switchMap((data) => data.extensionResult$),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    private data$ = new ReplaySubject<MetadataFormData>(1);
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
    }
}
