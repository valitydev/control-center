import { combineLatest, switchMap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { Component, HostBinding, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validator } from '@angular/forms';

import { FormControlSuperclass, createControlProviders } from '@vality/matez';
import { Field, ValueType } from '@vality/thrift-ts';

import { ThriftData } from '../../../../models';
import { ThriftAstMetadata } from '../../../../types';
import { ThriftFormExtension, getExtensionsResult } from '../../types/thrift-form-extension';
import { ComplexFormComponent } from '../complex-form/complex-form.component';
import { EnumFieldComponent } from '../enum-field/enum-field.component';
import { ExtensionFieldComponent } from '../extension-field/extension-field.component';
import { PrimitiveFieldComponent } from '../primitive-field/primitive-field.component';
import { StructFormComponent } from '../struct-form/struct-form.component';
import { TypedefFormComponent } from '../typedef-form/typedef-form.component';
import { UnionFieldComponent } from '../union-field/union-field.component';

@Component({
    selector: 'v-thrift-form',
    templateUrl: './thrift-form.component.html',
    styleUrl: `./thrift-form.component.scss`,
    providers: createControlProviders(() => ThriftFormComponent),
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ComplexFormComponent,
        StructFormComponent,
        UnionFieldComponent,
        TypedefFormComponent,
        EnumFieldComponent,
        ExtensionFieldComponent,
        PrimitiveFieldComponent,
    ],
})
export class ThriftFormComponent<T> extends FormControlSuperclass<T> implements Validator {
    metadata = input.required<ThriftAstMetadata[]>();
    namespace = input.required<string>();
    type = input.required<ValueType>();
    field = input<Field>();
    parent = input<ThriftData>();
    extensions = input<ThriftFormExtension[]>();

    data = computed(
        () =>
            new ThriftData(
                this.metadata(),
                this.namespace(),
                this.type(),
                this.field(),
                this.parent(),
            ),
    );
    private extensionResult$ = combineLatest([
        toObservable(this.extensions),
        toObservable(this.data),
    ]).pipe(
        switchMap(([extensions, data]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    extensionResult = toSignal(this.extensionResult$);
    @HostBinding('class.v-thrift-form-hidden') get hidden() {
        return this.extensionResult()?.hidden;
    }

    override validate(control) {
        return (
            super.validate(control) ||
            (this.extensionResult()?.validators || []).reduce((errors, validator) => {
                const result = validator(control);
                return result ? { ...(errors || {}), ...result } : errors;
            }, null)
        );
    }
}
