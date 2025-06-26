import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, OnInit, inject, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import {
    AutocompleteFieldModule,
    ComponentChanges,
    FormControlSuperclass,
    Option,
    createControlProviders,
    getValueChanges,
} from '@vality/matez';
import { ThriftType } from '@vality/thrift-ts';
import { Observable, ReplaySubject, combineLatest, defer, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ThriftData, getAliases } from '../../../../models';
import { getValueTypeTitle } from '../../../../utils';
import { ThriftViewerModule } from '../../../thrift-viewer';
import { FieldLabelPipe } from '../../pipes/field-label.pipe';
import {
    ThriftFormExtension,
    ThriftFormExtensionResult,
    getExtensionsResult,
} from '../../types/thrift-form-extension';

@Component({
    selector: 'v-primitive-field',
    templateUrl: './primitive-field.component.html',
    providers: createControlProviders(() => PrimitiveFieldComponent),
    styleUrl: './primitive-field.component.scss',
    imports: [
        CommonModule,
        MatRadioModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        AutocompleteFieldModule,
        MatIconModule,
        FieldLabelPipe,
        ThriftViewerModule,
    ],
})
export class PrimitiveFieldComponent<T>
    extends FormControlSuperclass<T>
    implements OnChanges, OnInit
{
    private destroyRef = inject(DestroyRef);
    @Input() data!: ThriftData<ThriftType>;
    @Input() extensions?: ThriftFormExtension[];

    extensionResult$: Observable<ThriftFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(
        map((r) => r?.generate as NonNullable<ThriftFormExtensionResult['generate']>),
    );
    options$ = this.extensionResult$.pipe(
        map((extensionResult): Option<T>[] =>
            extensionResult?.options?.length
                ? extensionResult.options.map((o) => ({
                      label: o.label || `#${o.value}`,
                      value: o.value as never,
                      description: String(o.value),
                  }))
                : [],
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selectedExtensionOption$ = combineLatest([
        this.extensionResult$,
        getValueChanges(this.control),
    ]).pipe(
        map(([result]) => result?.options?.find?.((o) => o.value === this.control.value)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selectedOption$ = combineLatest([this.options$, getValueChanges(this.control)]).pipe(
        map(([options]) => options.find((o) => o.value === this.control.value)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selectedHint$ = this.selectedOption$.pipe(
        map((s) => {
            if (!s) {
                return '';
            }
            const aliases = [...getAliases(this.data), ...(this.data.field ? [this.data] : [])]
                .filter((d) => d.typeGroup !== 'primitive')
                .map((d) => getValueTypeTitle(d.type))
                .filter((t) => t !== this.data.field?.name)
                .join(', ');
            return s.label + (aliases ? ` (${aliases})` : '');
        }),
    );
    detailsShown = model(false);

    get inputType(): string {
        switch (this.data.type) {
            case 'double':
            case 'int':
            case 'i8':
            case 'i16':
            case 'i32':
            case 'i64':
                return 'number';
            case 'string':
            default:
                return 'string';
        }
    }

    private data$ = new ReplaySubject<ThriftData<ThriftType>>(1);
    private extensions$ = new ReplaySubject<ThriftFormExtension[]>(1);

    constructor() {
        super();
    }

    override ngOnInit() {
        super.ngOnInit();
        getValueChanges(this.control)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.detailsShown.set(false);
            });
    }

    override ngOnChanges(changes: ComponentChanges<PrimitiveFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.data) {
            this.data$.next(this.data);
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

    toggleDetails() {
        this.detailsShown.update((s) => !s);
    }
}
