import { getCurrencySymbol } from '@angular/common';
import {
    Component,
    Input,
    Injector,
    Inject,
    LOCALE_ID,
    OnInit,
    booleanAttribute,
    DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validator, ValidationErrors, FormControl } from '@angular/forms';
import { createMask } from '@ngneat/input-mask';
import { FormComponentSuperclass, createControlProviders, getValueChanges } from '@vality/ng-core';
import sortBy from 'lodash-es/sortBy';
import { combineLatest } from 'rxjs';
import { map, switchMap, first, distinctUntilChanged } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

export interface Cash {
    amount: number;
    currencyCode: string;
}

const GROUP_SEPARATOR = ' ';

@Component({
    selector: 'cc-cash-field',
    templateUrl: './cash-field.component.html',
    providers: createControlProviders(() => CashFieldComponent),
})
export class CashFieldComponent extends FormComponentSuperclass<Cash> implements Validator, OnInit {
    @Input() label?: string;
    @Input({ transform: booleanAttribute }) required: boolean = false;
    @Input({ transform: booleanAttribute }) minor: boolean = false;

    amountControl = new FormControl<string>(null);
    currencyCodeControl = new FormControl<string>(null);

    currencies$ = combineLatest([
        getValueChanges(this.currencyCodeControl),
        this.domainStoreService.getObjects('currency'),
    ]).pipe(
        map(([code, currencies]) =>
            sortBy(currencies, 'data', 'symbolic_code').filter(
                (c) =>
                    c.data.symbolic_code.toUpperCase().includes(code) || c.data.name.includes(code),
            ),
        ),
    );

    amountMask$ = getValueChanges(this.currencyCodeControl).pipe(
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
        private destroyRef: DestroyRef,
    ) {
        super(injector);
    }

    ngOnInit() {
        combineLatest([
            getValueChanges(this.currencyCodeControl),
            getValueChanges(this.amountControl),
        ])
            .pipe(
                switchMap(([currencyCode]) => this.getCurrencyByCode(currencyCode)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((currency) => {
                const amountStr = this.amountControl.value;
                if (amountStr && currency && !this.validate()) {
                    const [whole, fractional] = amountStr.split('.');
                    if (fractional?.length > currency.data.exponent) {
                        this.amountControl.setValue(
                            `${whole}.${fractional.slice(0, currency.data.exponent)}`,
                        );
                    }
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
