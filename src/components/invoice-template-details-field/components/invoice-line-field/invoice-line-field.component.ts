import { Component, DestroyRef, effect, inject, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, FormValueControl, form } from '@angular/forms/signals';

import { Cash, InvoiceLine } from '@vality/domain-proto/domain';
import { InputFieldModule } from '@vality/matez';

import {
    CashFieldComponent,
    Cash as CashFieldValue,
} from '~/components/cash-field/cash-field.component';

@Component({
    selector: 'cc-invoice-line-field',
    templateUrl: './invoice-line-field.component.html',
    imports: [ReactiveFormsModule, FormField, InputFieldModule, CashFieldComponent],
})
export class InvoiceLineFieldComponent implements FormValueControl<InvoiceLine> {
    private destroyRef = inject(DestroyRef);

    currency = input<string>();
    value = model<InvoiceLine>(null);
    control = form(this.value);
    priceControl = new FormControl<CashFieldValue>(null);

    constructor() {
        this.priceControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((price) => {
                this.value.update((value) => ({
                    ...value,
                    price: this.toCash(price),
                }));
            });
    }

    private toCash(value: CashFieldValue): Cash {
        return value
            ? {
                  amount: value.amount,
                  currency: { symbolic_code: this.currency() || value.currencyCode },
              }
            : null;
    }
}
