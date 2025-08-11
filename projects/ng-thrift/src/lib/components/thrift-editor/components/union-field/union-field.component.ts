import { ReplaySubject, defer, merge } from 'rxjs';
import { delay, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, OnInit, forwardRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import {
    ComponentChanges,
    FormComponentSuperclass,
    createControlProviders,
    getErrorsTree,
} from '@vality/matez';
import { Field, Unions } from '@vality/thrift-ts';

import { ThriftData } from '../../../../models';
import { getFieldLabel } from '../../../../utils';
import { FieldLabelPipe } from '../../pipes/field-label.pipe';
import { ThriftFormExtension } from '../../types/thrift-form-extension';
import { getDefaultValue } from '../../utils';
import { ThriftFormComponent } from '../thrift-form/thrift-form.component';

@Component({
    selector: 'v-union-field',
    templateUrl: './union-field.component.html',
    providers: createControlProviders(() => UnionFieldComponent),
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        FieldLabelPipe,
        MatSelectModule,
        MatButtonModule,
        forwardRef(() => ThriftFormComponent),
    ],
})
export class UnionFieldComponent<T extends Record<string, unknown>>
    extends FormComponentSuperclass<T>
    implements OnInit, Validator, OnChanges
{
    private destroyRef = inject(DestroyRef);
    @Input() data!: ThriftData<string, 'union'>;
    @Input() extensions?: ThriftFormExtension[];

    fieldControl = new FormControl() as FormControl<Field>;
    internalControl = new FormControl() as FormControl<T[keyof T]>;

    protected options$ = defer(() => this.data$).pipe(
        map((data) =>
            data.ast
                ? (data.ast as ValuesType<Unions>)
                      .map((field) => ({ label: getFieldLabel(field.type, field), value: field }))
                      .sort((a, b) => a.label.localeCompare(b.label))
                : [],
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private data$ = new ReplaySubject<ThriftData<string, 'union'>>(1);

    override ngOnInit() {
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
                this.emitOutgoingValue(value as T);
            });
        this.fieldControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.cleanInternal(true);
        });
    }

    override ngOnChanges(changes: ComponentChanges<UnionFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.data) {
            this.data$.next(this.data);
        }
    }

    override validate(): ValidationErrors | null {
        return (
            this.fieldControl.errors ||
            (this.fieldControl.value ? getErrorsTree(this.internalControl) : null)
        );
    }

    handleIncomingValue(value: T) {
        if (value) {
            const name: keyof T = Object.keys(value)[0];
            this.fieldControl.setValue(
                this.data.ast
                    ? ((this.data.ast as ValuesType<Unions>).find((f) => f.name === name) as Field)
                    : (undefined as never),
                { emitEvent: false },
            );
            this.internalControl.setValue(value[name], { emitEvent: false });
        } else {
            this.fieldControl.reset(null as never, { emitEvent: false });
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
