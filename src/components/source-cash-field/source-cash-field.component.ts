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
    toMinorByExponent,
    toMajorByExponent,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { combineLatest, switchMap, of } from 'rxjs';
import { map, distinctUntilChanged, shareReplay, startWith, take } from 'rxjs/operators';

import { DomainStoreService } from '../../app/api/domain-config';
import { FetchSourcesService } from '../../app/sections/sources';

export interface SourceCash {
    amount: number;
    sourceId: StatSource['id'];
}

const GROUP_SEPARATOR = ' ';
const DEFAULT_EXPONENT = 2;
const RADIX_POINT = '.';

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

    options$ = this.fetchSourcesService.sources$.pipe(
        startWith([] as StatSource[]),
        map((sources): Option<StatSource>[] =>
            sources.map((s) => ({
                label: s.currency_symbolic_code,
                description: s.name,
                value: s,
            })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    currencyExponent$ = getValueChanges(this.sourceControl).pipe(
        switchMap((source) => this.getCurrencyExponent(source?.currency_symbolic_code)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    amountMask$ = this.currencyExponent$.pipe(
        distinctUntilChanged(),
        map((exponent) =>
            createMask({
                alias: 'numeric',
                groupSeparator: GROUP_SEPARATOR,
                radixPoint: RADIX_POINT,
                digits: exponent,
                digitsOptional: true,
                placeholder: '',
                onBeforePaste: (pastedValue: string) =>
                    this.convertPastedToStringNumber(pastedValue),
            }),
        ),
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
        super.ngOnInit();
        combineLatest([
            combineLatest([getValueChanges(this.amountControl), this.currencyExponent$]).pipe(
                map(([amountStr, exponent]) => {
                    const amount = amountStr
                        ? Number(amountStr.replaceAll(GROUP_SEPARATOR, ''))
                        : null;
                    return isNil(amount) ? null : toMinorByExponent(amount, exponent);
                }),
                distinctUntilChanged(),
            ),
            getValueChanges(this.sourceControl).pipe(
                map((s) => s?.id),
                distinctUntilChanged(),
            ),
        ])
            .pipe(
                map(([amount, sourceId]) =>
                    !isNil(amount) && sourceId ? { amount, sourceId } : null,
                ),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
    }

    validate(): ValidationErrors | null {
        return !this.amountControl.value || !this.sourceControl.value
            ? { invalidCash: true }
            : null;
    }

    handleIncomingValue(value: SourceCash) {
        const { sourceId, amount } = value || {};
        if (!sourceId) {
            this.setValues(amount, null);
            return;
        }
        this.options$
            .pipe(
                map((options) => options.find((o) => o.value.id === value.sourceId)?.value ?? null),
                switchMap((s) =>
                    combineLatest([of(s), this.getCurrencyExponent(s?.currency_symbolic_code)]),
                ),
                take(1),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(([source, exponent]) => {
                this.setValues(amount, source, exponent);
            });
    }

    private getCurrencyExponent(symbolicCode: string) {
        return this.domainStoreService
            .getObjects('currency')
            .pipe(
                map(
                    (currencies) =>
                        currencies.find((c) => c.data.symbolic_code === symbolicCode)?.data
                            ?.exponent ?? DEFAULT_EXPONENT,
                ),
            );
    }

    private setValues(amount: number, source: StatSource, exponent: number = DEFAULT_EXPONENT) {
        this.sourceControl.setValue(source);
        this.amountControl.setValue(
            typeof amount === 'number' ? String(toMajorByExponent(amount, exponent)) : null,
        );
    }

    private convertPastedToStringNumber(pastedValue: string) {
        return pastedValue.replaceAll(',', RADIX_POINT);
    }
}
