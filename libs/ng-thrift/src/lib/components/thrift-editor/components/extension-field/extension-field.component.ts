import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    Validator,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    ComponentChanges,
    DatetimeFieldModule,
    FormComponentSuperclass,
    createControlProviders,
} from '@vality/matez';
import { ThriftType } from '@vality/thrift-ts';
import { Observable, ReplaySubject, combineLatest, defer, switchMap } from 'rxjs';
import { first, map, shareReplay } from 'rxjs/operators';

import { ThriftData, getAliases } from '../../../../models';
import { getValueTypeTitle } from '../../../../utils';
import { FieldLabelPipe } from '../../pipes/field-label.pipe';
import {
    Converter,
    ThriftFormExtension,
    ThriftFormExtensionResult,
    getExtensionsResult,
} from '../../types/thrift-form-extension';

@Component({
    selector: 'v-extension-field',
    templateUrl: './extension-field.component.html',
    providers: createControlProviders(() => ExtensionFieldComponent),
    imports: [
        CommonModule,
        DatetimeFieldModule,
        MatIconModule,
        ReactiveFormsModule,
        FieldLabelPipe,
        MatButtonModule,
    ],
})
export class ExtensionFieldComponent<T>
    extends FormComponentSuperclass<T>
    implements Validator, OnChanges, OnInit
{
    private destroyRef = inject(DestroyRef);
    @Input() data!: ThriftData<ThriftType>;
    @Input() extensions?: ThriftFormExtension[];

    control = new FormControl<T>(null as T);

    extensionResult$: Observable<ThriftFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(
        map((v) => v?.generate as NonNullable<ThriftFormExtensionResult['generate']>),
    );

    get aliases() {
        return [...getAliases(this.data), ...(this.data.field ? [this.data] : [])]
            .filter((d) => d.typeGroup !== 'primitive')
            .map((d) => getValueTypeTitle(d.type))
            .filter((t) => t !== this.data.field?.name)
            .join(', ');
    }

    private data$ = new ReplaySubject<ThriftData>(1);
    private extensions$ = new ReplaySubject<ThriftFormExtension[]>(1);
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
            this.extensions$.next(this.extensions as ThriftFormExtension[]);
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
