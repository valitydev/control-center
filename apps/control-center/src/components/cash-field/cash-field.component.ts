import { CommonModule, getCurrencySymbol } from '@angular/common';
import {
    Component,
    DestroyRef,
    Input,
    LOCALE_ID,
    OnInit,
    booleanAttribute,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputMaskModule, createMask } from '@ngneat/input-mask';
import { CurrencyObject } from '@vality/domain-proto/domain';
import {
    FormComponentSuperclass,
    Option,
    SelectFieldModule,
    compareDifferentTypes,
    createControlProviders,
    getValueChanges,
    toMajorByExponent,
    toMinorByExponent,
} from '@vality/matez';
import isNil from 'lodash-es/isNil';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, take } from 'rxjs/operators';

import { CurrenciesStoreService } from '../../app/api/domain-config';

export interface Cash {
    amount: number;
    currencyCode: string;
}

const GROUP_SEPARATOR = ' ';
const DEFAULT_EXPONENT = 2;
const RADIX_POINT = '.';

@Component({
    selector: 'cc-cash-field',
    templateUrl: './cash-field.component.html',
    providers: createControlProviders(() => CashFieldComponent),
    imports: [
        MatFormField,
        ReactiveFormsModule,
        InputMaskModule,
        SelectFieldModule,
        CommonModule,
        MatInputModule,
    ],
})
export class CashFieldComponent extends FormComponentSuperclass<Cash> implements Validator, OnInit {
    private _locale = inject<string>(LOCALE_ID);
    private destroyRef = inject(DestroyRef);
    private currenciesStoreService = inject(CurrenciesStoreService);

    @Input() label?: string;
    @Input({ transform: booleanAttribute }) required: boolean = false;

    amountControl = new FormControl<string>(null);
    currencyControl = new FormControl<CurrencyObject>(null);

    options$ = this.currenciesStoreService.currencies$.pipe(
        startWith([] as CurrencyObject[]),
        map((objs): Option<CurrencyObject>[] =>
            objs
                .sort((a, b) => compareDifferentTypes(a.data.symbolic_code, b.data.symbolic_code))
                .map((s) => ({
                    label: s.data.symbolic_code,
                    description: s.data.name,
                    value: s,
                })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    currencyExponent$ = getValueChanges(this.currencyControl).pipe(
        map((obj) => obj?.data?.exponent ?? DEFAULT_EXPONENT),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    amountMask$ = this.currencyExponent$.pipe(
        distinctUntilChanged(),
        map((exponent) =>
            createMask({
                alias: 'numeric',
                groupSeparator: GROUP_SEPARATOR,
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
        return this.currencyControl.value?.data?.symbolic_code;
    }

    get prefix() {
        return getCurrencySymbol(this.currencyCode, 'narrow', this._locale);
    }

    override ngOnInit() {
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
            getValueChanges(this.currencyControl).pipe(
                map((obj) => obj?.data?.symbolic_code),
                distinctUntilChanged(),
            ),
        ])
            .pipe(
                map(([amount, currencyCode]) =>
                    !isNil(amount) && currencyCode ? { amount, currencyCode } : null,
                ),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
    }

    override validate(): ValidationErrors | null {
        return !this.amountControl.value || !this.currencyControl.value
            ? { invalidCash: true }
            : null;
    }

    handleIncomingValue(value: Cash) {
        const { currencyCode, amount } = value || {};
        if (!currencyCode) {
            this.setValues(amount, null);
        }
        this.options$
            .pipe(
                map(
                    (options) =>
                        options.find((o) => o.value?.data?.symbolic_code === value.currencyCode)
                            ?.value ?? null,
                ),
                take(1),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((obj) => {
                this.setValues(amount, obj);
            });
    }

    private setValues(amount: number, currencyObject: CurrencyObject) {
        this.currencyControl.setValue(currencyObject);
        this.amountControl.setValue(
            typeof amount === 'number'
                ? String(
                      toMajorByExponent(amount, currencyObject?.data?.exponent ?? DEFAULT_EXPONENT),
                  )
                : null,
        );
    }

    private convertPastedToStringNumber(pastedValue: string) {
        return pastedValue.replaceAll(',', RADIX_POINT);
    }
}
