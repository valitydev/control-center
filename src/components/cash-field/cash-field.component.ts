import { Component, Input } from '@angular/core';
import { Validator, ValidationErrors } from '@angular/forms';
import { createMask } from '@ngneat/input-mask';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { coerceBoolean } from 'coerce-property';
import CurrencyList from 'currency-list';
import sortBy from 'lodash-es/sortBy';

import { createControlProviders } from '../../utils';

export interface Cash {
    amount: number;
    currencyCode: string;
}

const GROUP_SEPARATOR = ' ';

@Component({
    selector: 'cc-cash-field',
    templateUrl: './cash-field.component.html',
    providers: createControlProviders(CashFieldComponent),
})
export class CashFieldComponent extends FormComponentSuperclass<Cash> implements Validator {
    @Input() label?: string;
    @Input() @coerceBoolean required: boolean = false;

    amount: string;
    currencyCode: string = '';
    options = this.getCurrencies();
    amountMask = this.createAmountMask();
    currencyMask = createMask({ mask: 'AAA', placeholder: '' });

    get decimalDigits() {
        return CurrencyList.get(this.currencyCode)?.decimal_digits || 2;
    }

    get prefix() {
        return CurrencyList.get(this.currencyCode)
            ? (0)
                  .toLocaleString('ru', {
                      style: 'currency',
                      currency: this.currencyCode,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                  })
                  .replace(/\d/g, '')
                  .trim()
            : '';
    }

    validate(): ValidationErrors | null {
        return !this.amount || this.currencyCode?.length !== 3 ? { invalidCash: true } : null;
    }

    handleIncomingValue(value: Cash) {
        this.amountChanged(typeof value?.amount === 'number' ? String(value.amount) : null);
        this.currencyChanged(value?.currencyCode);
    }

    amountChanged(amount: string) {
        this.amount = amount;
        this.update();
    }

    currencyChanged(currencyCode: string) {
        this.currencyCode = currencyCode;
        this.amountMask = this.createAmountMask();
        this.options = this.getCurrencies();
        this.update();
    }

    private update() {
        if (this.amount && this.currencyCode && !this.validate()) {
            const [whole, fractional] = this.amount.split('.');
            if (fractional?.length > this.decimalDigits)
                this.amount = `${whole}.${fractional.slice(0, this.decimalDigits)}`;
            const amount = Number(this.amount.replaceAll(GROUP_SEPARATOR, ''));
            this.emitOutgoingValue({ amount, currencyCode: this.currencyCode });
        } else {
            this.emitOutgoingValue(null);
        }
    }

    private createAmountMask() {
        return createMask({
            alias: 'numeric',
            groupSeparator: GROUP_SEPARATOR,
            digits: this.decimalDigits,
            digitsOptional: true,
            placeholder: '',
        });
    }

    private getCurrencies() {
        const currensies = sortBy(Object.values(CurrencyList.getAll('en')), 'code');
        return this.currencyCode
            ? currensies.filter(
                  (v) =>
                      v.name.toUpperCase().includes(this.currencyCode) ||
                      v.code.includes(this.currencyCode)
              )
            : currensies;
    }
}
