import { combineLatest } from 'rxjs';
import { catchError, distinctUntilChanged, map, skipWhile, switchMap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import {
    AutocompleteFieldModule,
    FormControlSuperclass,
    NotifyLogService,
    Option,
    compareDifferentTypes,
    createControlProviders,
} from '@vality/matez';

import { CurrenciesStoreService } from '~/api/domain-config';
import { ThriftAccountManagementService } from '~/api/services';

import { getValueChanges } from '../../../projects/matez/src/lib/utils/form/get-value-changes';

export interface CurrencyAccount {
    currency: string;
    accounts: number[];
}

@Component({
    selector: 'cc-account-field',
    imports: [CommonModule, ReactiveFormsModule, AutocompleteFieldModule],
    templateUrl: './account-field.component.html',
    providers: createControlProviders(() => AccountFieldComponent),
})
export class AccountFieldComponent
    extends FormControlSuperclass<CurrencyAccount | null>
    implements OnInit
{
    private currenciesStoreService = inject(CurrenciesStoreService);
    private accountManagementService = inject(ThriftAccountManagementService);
    private dr = inject(DestroyRef);
    private log = inject(NotifyLogService);

    accountsNumber = input(1);

    currencyControl = new FormControl<string | null>(null, { nonNullable: true });

    options$ = this.currenciesStoreService.currencies$.pipe(
        map((currencies): Option<string>[] =>
            currencies
                .sort((a, b) => compareDifferentTypes(a.symbolic_code, b.symbolic_code))
                .map((currency) => ({
                    label: currency.symbolic_code,
                    description: currency.name,
                    value: currency.symbolic_code,
                })),
        ),
    );

    override ngOnInit() {
        super.ngOnInit();
        this.currencyControl.valueChanges
            .pipe(
                skipWhile((currency) => currency?.length !== 3),
                distinctUntilChanged(),
                switchMap((currency) => this.createAccounts(currency)),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((accounts) => {
                this.control.setValue({
                    currency: this.currencyControl.value,
                    accounts,
                });
            });
        getValueChanges(this.control)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((value) => {
                if (value?.currency && this.currencyControl.value !== value?.currency)
                    this.currencyControl.setValue(value?.currency ?? null, { emitEvent: false });
            });
    }

    createAccounts(currency: string) {
        return combineLatest(
            new Array(this.accountsNumber()).fill(null).map((_, idx) =>
                this.accountManagementService
                    .CreateAccount({
                        currency_sym_code: currency,
                    })
                    .pipe(
                        catchError((err) => {
                            this.log.error(
                                err,
                                `Failed to create account #${idx + 1} with ${currency} currency`,
                            );
                            throw err;
                        }),
                    ),
            ),
        );
    }
}
