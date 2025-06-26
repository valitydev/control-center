import { CommonModule } from '@angular/common';
import {
    Component,
    DestroyRef,
    HostBinding,
    Input,
    OnChanges,
    OnInit,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validator } from '@angular/forms';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';
import { Field, ValueType } from '@vality/thrift-ts';
import { BehaviorSubject, Observable, defer, switchMap } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { ThriftData } from '../../../../models';
import { ThriftAstMetadata } from '../../../../types';
import {
    ThriftFormExtension,
    ThriftFormExtensionResult,
    getExtensionsResult,
} from '../../types/thrift-form-extension';
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
export class ThriftFormComponent<T>
    extends FormControlSuperclass<T>
    implements OnInit, OnChanges, Validator
{
    private destroyRef = inject(DestroyRef);
    @Input() metadata!: ThriftAstMetadata[];
    @Input() namespace!: string;
    @Input() type?: ValueType;
    @Input() field?: Field;
    @Input() parent?: ThriftData;
    @Input() extensions?: ThriftFormExtension[];

    @HostBinding('class.v-thrift-form-hidden') hidden = false;

    data!: ThriftData;
    extensionResult$: Observable<ThriftFormExtensionResult> = defer(() => this.updated$).pipe(
        switchMap(() => getExtensionsResult(this.extensions, this.data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private updated$ = new BehaviorSubject<void>(undefined);

    constructor() {
        super();
    }

    override ngOnInit() {
        super.ngOnInit();
        this.extensionResult$
            .pipe(
                map((res) => !!res?.hidden),
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
                this.data = undefined as never;
                console.warn(err);
            }
        }
    }
}
