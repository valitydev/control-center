import { Component, Input, OnChanges, DestroyRef, model, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ComponentChanges,
    Option,
    FormControlSuperclass,
    createControlProviders,
    getValueChanges,
} from '@vality/ng-core';
import { getValueTypeTitle } from '@vality/ng-thrift';
import { ThriftType } from '@vality/thrift-ts';
import { combineLatest, defer, ReplaySubject, switchMap, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {
    MetadataFormExtensionResult,
    MetadataFormExtension,
    getAliases,
} from '@cc/app/shared/components/metadata-form';

import { MetadataFormData } from '../../types/metadata-form-data';
import { getExtensionsResult } from '../../types/metadata-form-extension';

@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
    providers: createControlProviders(() => PrimitiveFieldComponent),
    styleUrl: './primitive-field.component.scss',
})
export class PrimitiveFieldComponent<T>
    extends FormControlSuperclass<T>
    implements OnChanges, OnInit
{
    @Input() data: MetadataFormData<ThriftType>;
    @Input() extensions: MetadataFormExtension[];

    extensionResult$: Observable<MetadataFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(map((r) => r?.generate));
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

    private data$ = new ReplaySubject<MetadataFormData<ThriftType>>(1);
    private extensions$ = new ReplaySubject<MetadataFormExtension[]>(1);

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        getValueChanges(this.control)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.detailsShown.set(false);
            });
    }

    ngOnChanges(changes: ComponentChanges<PrimitiveFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.data) {
            this.data$.next(this.data);
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

    toggleDetails() {
        this.detailsShown.update((s) => !s);
    }
}
