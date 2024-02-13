import { getCurrencySymbol, CommonModule } from '@angular/common';
import {
    Component,
    Input,
    Inject,
    LOCALE_ID,
    OnInit,
    booleanAttribute,
    DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validator, ValidationErrors, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createMask, InputMaskModule } from '@ngneat/input-mask';
import { StatSource } from '@vality/fistful-proto/fistful_stat';
import {
    FormComponentSuperclass,
    createControlProviders,
    getValueChanges,
    Option,
    SelectFieldModule,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { combineLatest } from 'rxjs';
import { map, first, distinctUntilChanged, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '../../app/api/domain-config';
import { FetchSourcesService } from '../../app/sections/sources';

export interface SourceCash {
    amount: number;
    sourceId: StatSource['id'];
}

const GROUP_SEPARATOR = ' ';

@Component({
    standalone: true,
    selector: 'cc-source-cash-field',
    templateUrl: './source-cash-field.component.html',
    providers: createControlProviders(() => SourceCashFieldComponent),
    imports: [
        MatFormField,
        ReactiveFormsModule,
        InputMaskModule,
        SelectFieldModule,
        CommonModule,
        MatInputModule,
    ],
})
export class SourceCashFieldComponent
    extends FormComponentSuperclass<SourceCash>
    implements Validator, OnInit
{
    @Input() label?: string;
    @Input({ transform: booleanAttribute }) required: boolean = false;

    amountControl = new FormControl<string>(null);
    sourceControl = new FormControl<StatSource>(null);

    amountMask$ = getValueChanges(this.sourceControl).pipe(
        distinctUntilChanged(),
        map(() =>
            createMask({
                alias: 'numeric',
                groupSeparator: GROUP_SEPARATOR,
                digits: 0,
                digitsOptional: true,
                placeholder: '',
            }),
        ),
    );
    options$ = this.fetchSourcesService.sources$.pipe(
        map((sources): Option<StatSource>[] =>
            sources.map((s) => ({
                label: s.currency_symbolic_code,
                description: s.name,
                value: s,
            })),
        ),
    );
    amountSource$ = combineLatest([
        getValueChanges(this.amountControl).pipe(
            map((amountStr) =>
                amountStr ? Number(amountStr.replaceAll(GROUP_SEPARATOR, '')) : null,
            ),
            distinctUntilChanged(),
        ),
        getValueChanges(this.sourceControl),
        this.domainStoreService.getObjects('currency'),
    ]).pipe(
        map(([amount, source, currencies]) =>
            !isNil(amount) && source
                ? {
                      amount,
                      source,
                      currency: currencies.find(
                          (c) => c.data.symbolic_code === source.currency_symbolic_code,
                      ),
                  }
                : null,
        ),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    get currencyCode() {
        return this.sourceControl.value?.currency_symbolic_code;
    }

    get prefix() {
        return getCurrencySymbol(this.currencyCode, 'narrow', this._locale);
    }

    constructor(
        @Inject(LOCALE_ID) private _locale: string,
        private destroyRef: DestroyRef,
        private fetchSourcesService: FetchSourcesService,
        private domainStoreService: DomainStoreService,
    ) {
        super();
    }

    ngOnInit() {
        this.amountSource$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((amountSource) => {
            this.emitOutgoingValue(
                amountSource
                    ? { amount: amountSource.amount, sourceId: amountSource.source.id }
                    : null,
            );
        });
    }

    validate(): ValidationErrors | null {
        return !this.amountControl.value || !this.sourceControl.value
            ? { invalidCash: true }
            : null;
    }

    handleIncomingValue(value: SourceCash) {
        this.amountControl.setValue(
            typeof value?.amount === 'number' ? String(value.amount) : null,
        );
        if (value?.sourceId) {
            this.options$.pipe(first()).subscribe((opts) => {
                this.sourceControl.setValue(opts.find((o) => o.value.id === value.sourceId).value);
            });
        } else {
            this.sourceControl.setValue(null);
        }
    }
}
