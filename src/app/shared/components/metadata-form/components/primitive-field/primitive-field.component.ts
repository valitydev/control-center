import { Component, Input, OnChanges, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ComponentChanges,
    Option,
    FormControlSuperclass,
    createControlProviders,
} from '@vality/ng-core';
import { ThriftType } from '@vality/thrift-ts';
import { combineLatest, defer, ReplaySubject, switchMap, Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { getValueTypeTitle } from '@cc/app/shared';
import {
    MetadataFormExtensionResult,
    MetadataFormExtension,
} from '@cc/app/shared/components/metadata-form';

import { MetadataFormData, getAliases } from '../../types/metadata-form-data';
import { getFirstDeterminedExtensionsResult } from '../../types/metadata-form-extension';

@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
    providers: createControlProviders(() => PrimitiveFieldComponent),
})
export class PrimitiveFieldComponent<T> extends FormControlSuperclass<T> implements OnChanges {
    @Input() data: MetadataFormData<ThriftType>;
    @Input() extensions: MetadataFormExtension[];

    extensionResult$: Observable<MetadataFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getFirstDeterminedExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    generate$ = this.extensionResult$.pipe(map((r) => r?.generate));
    selected$ = combineLatest([
        this.extensionResult$,
        this.control.valueChanges.pipe(startWith(this.control.value)),
    ]).pipe(
        map(
            ([extensionResult]) =>
                extensionResult?.options?.find((o) => o.value === this.control.value),
        ),
    );
    options$ = this.extensionResult$.pipe(
        map((extensionResult): Option<T>[] =>
            extensionResult?.options?.length
                ? extensionResult.options.map((o) => ({
                      label: o.label,
                      value: o.value as never,
                      description: String(o.value),
                  }))
                : null,
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

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

    get aliases() {
        return [...getAliases(this.data), ...(this.data.field ? [this.data] : [])]
            .filter((d) => d.typeGroup !== 'primitive')
            .map((d) => getValueTypeTitle(d.type))
            .filter((t) => t !== this.data.field?.name)
            .join(', ');
    }

    private data$ = new ReplaySubject<MetadataFormData<ThriftType>>(1);
    private extensions$ = new ReplaySubject<MetadataFormExtension[]>(1);

    constructor(private destroyRef: DestroyRef) {
        super();
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
}
