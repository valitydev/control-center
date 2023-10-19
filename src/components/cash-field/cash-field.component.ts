import { getCurrencySymbol } from '@angular/common';
import { Component, Input, Injector, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Validator, ValidationErrors, FormControl } from '@angular/forms';
import { createMask } from '@ngneat/input-mask';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { coerceBoolean } from 'coerce-property';
import sortBy from 'lodash-es/sortBy';
import { combineLatest } from 'rxjs';
import { map, switchMap, first, distinctUntilChanged } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { createControlProviders, getFormValueChanges } from '../../utils';

export interface Cash {
    amount: number;
    currencyCode: string;
}

const GROUP_SEPARATOR = ' ';

@UntilDestroy()
@Component({
    selector: 'cc-cash-field',
    templateUrl: './cash-field.component.html',
    providers: createControlProviders(() => CashFieldComponent),
})
export class CashFieldComponent extends FormComponentSuperclass<Cash> implements Validator, OnInit {
    @Input() label?: string;
    @Input() @coerceBoolean required: boolean = false;
    @Input() @coerceBoolean minor: boolean = false;

    amountControl = new FormControl<string>(null);
    currencyCodeControl = new FormControl<string>(null);

    currencies$ = combineLatest([
        getFormValueChanges(this.currencyCodeControl, true),
        this.domainStoreService.getObjects('currency'),
    ]).pipe(
        map(([code, currencies]) =>
            sortBy(currencies, 'data', 'symbolic_code').filter(
                (c) =>
                    c.data.symbolic_code.toUpperCase().includes(code) || c.data.name.includes(code),
            ),
        ),
    );

    amountMask$ = getFormValueChanges(this.currencyCodeControl, true).pipe(
        switchMap((code) => this.getCurrencyByCode(code)),
        map((c) => (this.minor ? 0 : c?.data?.exponent || 2)),
        distinctUntilChanged(),
        map((digits) =>
            createMask({
                alias: 'numeric',
                groupSeparator: GROUP_SEPARATOR,
                digits,
                digitsOptional: true,
                placeholder: '',
            }),
        ),
    );
    currencyMask = createMask({ mask: 'AAA', placeholder: '' });

    get prefix() {
        return getCurrencySymbol(this.currencyCodeControl.value, 'narrow', this._locale);
    }

    constructor(
        injector: Injector,
        @Inject(LOCALE_ID) private _locale: string,
        private domainStoreService: DomainStoreService,
    ) {
        super(injector);
    }

    ngOnInit() {
        combineLatest([
            getFormValueChanges(this.currencyCodeControl, true),
            getFormValueChanges(this.amountControl, true),
        ])
            .pipe(
                switchMap(([currencyCode]) => this.getCurrencyByCode(currencyCode)),
                untilDestroyed(this),
            )
            .subscribe((currency) => {
                const amountStr = this.amountControl.value;
                if (amountStr && currency && !this.validate()) {
                    const [whole, fractional] = amountStr.split('.');
                    if (fractional?.length > currency.data.exponent)
                        this.amountControl.setValue(
                            `${whole}.${fractional.slice(0, currency.data.exponent)}`,
                        );
                    const amount = Number(this.amountControl.value.replaceAll(GROUP_SEPARATOR, ''));
                    this.emitOutgoingValue({ amount, currencyCode: currency.data.symbolic_code });
                } else {
                    this.emitOutgoingValue(null);
                }
            });
    }

    validate(): ValidationErrors | null {
        return !this.amountControl.value || this.currencyCodeControl.value?.length !== 3
            ? { invalidCash: true }
            : null;
    }

    handleIncomingValue(value: Cash) {
        this.amountControl.setValue(
            typeof value?.amount === 'number' ? String(value.amount) : null,
        );
        this.currencyCodeControl.setValue(value?.currencyCode);
    }

    private getCurrencyByCode(currencyCode: string) {
        return this.domainStoreService.getObjects('currency').pipe(
            map((c) => c.find((v) => v.data.symbolic_code === currencyCode)),
            first(),
        );
    }
}
