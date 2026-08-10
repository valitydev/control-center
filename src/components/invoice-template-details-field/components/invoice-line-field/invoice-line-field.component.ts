import { Overwrite } from 'utility-types';

import { Component, effect, input, model, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, FormValueControl, form, transformedValue } from '@angular/forms/signals';

import { Cash, InvoiceLine } from '@vality/domain-proto/domain';
import { InputFieldModule } from '@vality/matez';

import {
    SourceCash,
    SourceCashFieldComponent,
} from '~/components/source-cash-field/source-cash-field.component';

type InvoiceLineFormValue = Overwrite<InvoiceLine, { price: SourceCash }>;

@Component({
    selector: 'cc-invoice-line-field',
    templateUrl: './invoice-line-field.component.html',
    imports: [ReactiveFormsModule, FormField, InputFieldModule, SourceCashFieldComponent],
})
export class InvoiceLineFieldComponent implements FormValueControl<InvoiceLine> {
    currency = input<string>();
    value = model<InvoiceLine>(null);
    formValue = transformedValue<InvoiceLine, InvoiceLineFormValue>(this.value, {
        parse: (value) => ({ value: this.toInvoiceLine(value) }),
        format: (value) => this.toFormValue(value),
    });
    control = form(this.formValue);

    constructor() {
        effect(() => {
            const currencySymbolicCode = this.currency();
            if (currencySymbolicCode) {
                untracked(() => {
                    this.formValue.update((value) => ({
                        ...value,
                        price: {
                            ...value.price,
                            sourceId: null,
                            currencySymbolicCode,
                        },
                    }));
                });
            }
        });
    }

    private toInvoiceLine(value: InvoiceLineFormValue): InvoiceLine {
        return value
            ? {
                  ...value,
                  price: this.toCash(value.price),
              }
            : null;
    }

    private toFormValue(value: InvoiceLine): InvoiceLineFormValue {
        return value
            ? {
                  ...value,
                  price: {
                      amount: value.price?.amount,
                      sourceId: null,
                      currencySymbolicCode: this.currency() || value.price?.currency?.symbolic_code,
                  },
              }
            : null;
    }

    private toCash(value: SourceCash): Cash {
        return value
            ? {
                  amount: value.amount,
                  currency: {
                      symbolic_code: this.currency() || value.currencySymbolicCode,
                  },
              }
            : null;
    }
}
