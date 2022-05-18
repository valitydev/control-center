import { Component, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { ThriftType } from '@vality/thrift-ts';
import { combineLatest, defer, ReplaySubject, switchMap } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';

import { ComponentChanges } from '@cc/app/shared';
import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
    styleUrls: ['primitive-field.component.scss'],
    providers: createValidatedAbstractControlProviders(PrimitiveFieldComponent),
})
export class PrimitiveFieldComponent
    extends WrappedFormControlSuperclass<unknown>
    implements OnChanges, Validator
{
    @Input() data: MetadataFormData<ThriftType>;

    extensionResult$ = defer(() => this.data$).pipe(
        switchMap((data) => data.extensionResult$),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    generate$ = this.extensionResult$.pipe(pluck('generate'));
    selected$ = combineLatest([this.extensionResult$, this.control.valueChanges]).pipe(
        map(([extensionResult, value]) => extensionResult.options.find((o) => o.value === value))
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

    private data$ = new ReplaySubject<MetadataFormData<ThriftType>>(1);

    ngOnChanges(changes: ComponentChanges<PrimitiveFieldComponent>) {
        super.ngOnChanges(changes);
        if (changes.data) this.data$.next(this.data);
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }

    generate(event: MouseEvent) {
        this.generate$
            .pipe(
                switchMap((generate) => generate()),
                untilDestroyed(this)
            )
            .subscribe((value) => this.control.setValue(value));
        event.stopPropagation();
    }

    clear(event: MouseEvent) {
        this.control.reset(null);
        event.stopPropagation();
    }
}
