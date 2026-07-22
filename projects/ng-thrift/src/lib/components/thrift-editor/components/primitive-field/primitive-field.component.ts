import { Observable, combineLatest, defer, of, switchMap } from 'rxjs';
import { debounceTime, filter, map, shareReplay } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    OnInit,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

import {
    AutocompleteFieldModule,
    FormControlSuperclass,
    Option,
    createControlProviders,
    getValueChanges,
    SelectFieldModule,
    tapLog,
} from '@vality/matez';
import { ThriftType } from '@vality/thrift-ts';

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
    changeDetection: ChangeDetectionStrategy.Eager,
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
        SelectFieldModule,
    ],
})
export class PrimitiveFieldComponent<T> extends FormControlSuperclass<T> implements OnInit {
    private destroyRef = inject(DestroyRef);
    data = input.required<ThriftData<ThriftType>>();
    extensions = input<ThriftFormExtension[]>();

    extensionResult$: Observable<ThriftFormExtensionResult> = combineLatest([
        toObservable(this.data).pipe(filter(Boolean)),
        toObservable(this.extensions),
    ]).pipe(
        switchMap(([data, extensions]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(
        map((r) => r?.generate as NonNullable<ThriftFormExtensionResult['generate']>),
    );
    searchChange = signal('');
    options$ = combineLatest([
        this.extensionResult$,
        toObservable(this.searchChange).pipe(debounceTime(500)),
    ]).pipe(
        switchMap(([extensionResult, searchChange]) => {
            if (extensionResult?.search) {
                return extensionResult
                    .search(searchChange)
                    .pipe(map(({ result }) => result as Option<T>[]));
            }
            return of(
                (extensionResult?.options || []).map(
                    (o): Option<T> => ({
                        label: o.label || `#${o.value}`,
                        value: o.value as never,
                        description: String(o.value),
                    }),
                ),
            );
        }),
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
            const aliases = [
                ...getAliases(this.data()),
                ...(this.data().field ? [this.data()] : []),
            ]
                .filter((d) => d.typeGroup !== 'primitive')
                .map((d) => getValueTypeTitle(d.type))
                .filter((t) => t !== this.data().field?.name)
                .join(', ');
            return s.label + (aliases ? ` (${aliases})` : '');
        }),
    );
    detailsShown = model(false);

    inputType = computed(() => {
        switch (this.data().type) {
            case 'double':
            case 'int':
            case 'i8':
            case 'i16':
            case 'i32':
            case 'i64':
                return 'number';
            case 'string':
            default:
                return 'text';
        }
    });

    override ngOnInit() {
        super.ngOnInit();
        getValueChanges(this.control)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.detailsShown.set(false);
            });
    }

    generate(event: MouseEvent) {
        this.generate$
            .pipe(
                switchMap((generate) => generate(this.control.value)),
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
