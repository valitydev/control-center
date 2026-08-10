import { Overwrite } from 'utility-types';

import { Component, computed, input, model } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, FormValueControl, form, transformedValue } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

import { Cash, InvoiceLine, InvoiceTemplateDetails } from '@vality/domain-proto/domain';

import { InvoiceLineFieldComponent } from './components/invoice-line-field/invoice-line-field.component';

type InvoiceTemplateDetailsFormValue = Overwrite<InvoiceTemplateDetails, { product?: InvoiceLine }>;

@Component({
    selector: 'cc-invoice-template-details-field',
    templateUrl: './invoice-template-details-field.component.html',
    imports: [
        ReactiveFormsModule,
        FormField,
        InvoiceLineFieldComponent,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatRadioModule,
    ],
})
export class InvoiceTemplateDetailsFieldComponent implements FormValueControl<InvoiceTemplateDetails> {
    currency = input<string>();
    value = model<InvoiceTemplateDetails>(null);
    formValue = transformedValue<InvoiceTemplateDetails, InvoiceTemplateDetailsFormValue>(
        this.value,
        {
            parse: (value) => ({ value: this.toInvoiceTemplateDetails(value) }),
            format: (value) => this.toFormValue(value),
        },
    );
    control = form(this.formValue);
    detailsType = computed<'cart' | 'product'>(() => (this.formValue()?.cart ? 'cart' : 'product'));

    selectDetailsType(type: 'cart' | 'product') {
        if (type !== this.detailsType()) {
            this.formValue.set(
                type === 'cart'
                    ? { cart: { lines: [this.createInvoiceLine()] } }
                    : { product: this.createInvoiceLine() },
            );
        }
    }

    addInvoiceLine() {
        this.formValue.update((value) => ({
            cart: {
                lines: [...(value?.cart?.lines ?? []), this.createInvoiceLine()],
            },
        }));
    }

    removeInvoiceLine(index: number) {
        this.formValue.update((value) => ({
            cart: {
                lines:
                    (value?.cart?.lines.length ?? 0) > 1
                        ? value.cart.lines.filter((_, i) => i !== index)
                        : value.cart.lines,
            },
        }));
    }

    private createCash(): Cash {
        return {
            amount: null,
            currency: { symbolic_code: this.currency() ?? '' },
        };
    }

    private createInvoiceLine(): InvoiceLine {
        return {
            product: '',
            quantity: 1,
            price: this.createCash(),
            metadata: new Map(),
        };
    }

    private toInvoiceTemplateDetails(
        value: InvoiceTemplateDetailsFormValue,
    ): InvoiceTemplateDetails {
        if (value?.product) {
            const { product, price, metadata } = value.product;
            return {
                product: {
                    product,
                    price: { fixed: price },
                    metadata,
                },
            };
        }
        return value?.cart ? { cart: value.cart } : null;
    }

    private toFormValue(value: InvoiceTemplateDetails): InvoiceTemplateDetailsFormValue {
        if (value?.product) {
            return {
                product: {
                    product: value.product.product,
                    quantity: 1,
                    price: value.product.price.fixed ?? this.createCash(),
                    metadata: value.product.metadata,
                },
            };
        }
        return value?.cart
            ? {
                  cart: {
                      lines: value.cart.lines.length
                          ? value.cart.lines
                          : [this.createInvoiceLine()],
                  },
              }
            : null;
    }
}
