import { Component, Input, OnChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ComponentChanges } from '@vality/ng-core';
import { ThriftType } from '@vality/thrift-ts';
import { combineLatest, defer, ReplaySubject, switchMap, Observable } from 'rxjs';
import { map, pluck, shareReplay, startWith } from 'rxjs/operators';

import { getValueTypeTitle } from '@cc/app/shared';
import {
    MetadataFormExtensionResult,
    MetadataFormExtension,
} from '@cc/app/shared/components/metadata-form';
import { getFirstDeterminedExtensionsResult } from '@cc/app/shared/components/metadata-form/types/metadata-form-extension';
import { createControlProviders, ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData, getAliases } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
    providers: createControlProviders(() => PrimitiveFieldComponent),
})
export class PrimitiveFieldComponent<T>
    extends ValidatedFormControlSuperclass<T>
    implements OnChanges
{
    @Input() data: MetadataFormData<ThriftType>;
    @Input() extensions: MetadataFormExtension[];

    extensionResult$: Observable<MetadataFormExtensionResult> = combineLatest([
        defer(() => this.data$),
        defer(() => this.extensions$),
    ]).pipe(
        switchMap(([data, extensions]) => getFirstDeterminedExtensionsResult(extensions, data)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    generate$ = this.extensionResult$.pipe(pluck('generate'));
    selected$ = combineLatest([this.extensionResult$, this.control.valueChanges]).pipe(
        map(([extensionResult, value]) => extensionResult?.options?.find((o) => o.value === value))
    );
    filteredOptions$ = combineLatest([
        this.control.valueChanges.pipe(startWith('')),
        this.extensionResult$,
    ]).pipe(
        map(([value, extensionResult]) => {
            const filterValue = String(value ?? '').toLowerCase();
            return extensionResult.options?.filter(
                (option) =>
                    String(option.value).toLowerCase().includes(filterValue) ||
                    (option.label && option.label.toLowerCase().includes(filterValue))
            );
        }),
        shareReplay({ refCount: true, bufferSize: 1 })
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

    ngOnChanges(changes: ComponentChanges<PrimitiveFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.data) this.data$.next(this.data);
        if (changes.extensions) this.extensions$.next(this.extensions);
    }

    generate(event: MouseEvent) {
        this.generate$
            .pipe(
                switchMap((generate) => generate()),
                untilDestroyed(this)
            )
            .subscribe((value) => this.control.setValue(value as T));
        event.stopPropagation();
    }

    clear(event: MouseEvent) {
        this.control.reset(null);
        event.stopPropagation();
    }
}
