import { Component, Input, OnInit, DestroyRef, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationErrors, Validator, FormControl } from '@angular/forms';
import {
    FormComponentSuperclass,
    createControlProviders,
    getErrorsTree,
    ComponentChanges,
} from '@vality/ng-core';
import { getFieldLabel } from '@vality/ng-thrift';
import { Field } from '@vality/thrift-ts';
import { merge, ReplaySubject, defer } from 'rxjs';
import { delay, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { MetadataFormData } from '../../types/metadata-form-data';
import { MetadataFormExtension } from '../../types/metadata-form-extension';
import { getDefaultValue } from '../../utils';

@Component({
    selector: 'cc-union-field',
    templateUrl: './union-field.component.html',
    providers: createControlProviders(() => UnionFieldComponent),
})
export class UnionFieldComponent<T extends { [N in string]: unknown }>
    extends FormComponentSuperclass<T>
    implements OnInit, Validator, OnChanges
{
    @Input() data: MetadataFormData<string, 'union'>;
    @Input() extensions: MetadataFormExtension[];

    fieldControl = new FormControl() as FormControl<Field>;
    internalControl = new FormControl() as FormControl<T[keyof T]>;

    protected options$ = defer(() => this.data$).pipe(
        map((data) =>
            data.ast
                .map((field) => ({ label: getFieldLabel(field.type, field), value: field }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private data$ = new ReplaySubject<MetadataFormData<string, 'union'>>(1);

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    ngOnInit() {
        merge(this.fieldControl.valueChanges, this.internalControl.valueChanges)
            .pipe(
                map(() => {
                    const field = this.fieldControl.value;
                    return field ? ({ [field.name]: this.internalControl.value } as T) : null;
                }),
                distinctUntilChanged(),
                delay(0),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
        this.fieldControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.cleanInternal(true);
        });
    }

    ngOnChanges(changes: ComponentChanges<UnionFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.data) {
            this.data$.next(this.data);
        }
    }

    validate(): ValidationErrors | null {
        return (
            this.fieldControl.errors ||
            (this.fieldControl.value ? getErrorsTree(this.internalControl) : null)
        );
    }

    handleIncomingValue(value: T) {
        if (value) {
            const name: keyof T = Object.keys(value)[0];
            this.fieldControl.setValue(
                this.data.ast.find((f) => f.name === name),
                { emitEvent: false },
            );
            this.internalControl.setValue(value[name], { emitEvent: false });
        } else {
            this.fieldControl.reset(null, { emitEvent: false });
            this.cleanInternal();
        }
    }

    cleanInternal(emitEvent = false) {
        this.internalControl.reset(
            getDefaultValue(
                this.data.metadata,
                this.data.namespace,
                this.fieldControl.value?.type,
            ) as T[keyof T],
            { emitEvent },
        );
    }
}
