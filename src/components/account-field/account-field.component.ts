import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import {
    Component,
    DestroyRef,
    computed,
    effect,
    inject,
    input,
    model,
    output,
    untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormValueControl, transformedValue } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
    AutocompleteFieldModule,
    NotifyLogService,
    Option,
    compareDifferentTypes,
    progressTo,
} from '@vality/matez';

import { CurrenciesStoreService } from '~/api/domain-config';
import { ThriftAccountManagementService } from '~/api/services';

export interface CurrencyAccount {
    currency: string;
    accounts: number[];
}

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

@Component({
    selector: 'cc-account-field',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AutocompleteFieldModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './account-field.component.html',
})
export class AccountFieldComponent implements FormValueControl<CurrencyAccount> {
    private currenciesStoreService = inject(CurrenciesStoreService);
    private accountManagementService = inject(ThriftAccountManagementService);
    private dr = inject(DestroyRef);
    private log = inject(NotifyLogService);

    label = input('Account currency');
    accountsNumber = input(1);
    optionalAccountsNumber = input(0);
    disabled = model(false);
    touch = output<void>();

    value = model<CurrencyAccount>(null);
    currency = transformedValue<CurrencyAccount, string>(this.value, {
        parse: (currency) => {
            const currentValue = this.value();
            if (!CURRENCY_CODE_PATTERN.test(currency)) {
                return {
                    error: {
                        kind: 'currencyFormat',
                        message: 'Currency must contain exactly 3 English letters',
                    },
                };
            }
            return {
                value: {
                    currency,
                    accounts: currency === currentValue?.currency ? currentValue.accounts : [],
                },
            };
        },
        format: (value) => value?.currency,
    });
    control = new FormControl<string>(null, { nonNullable: true });
    currencyAccounts = computed(() => this.value()?.accounts ?? []);
    progress$ = new BehaviorSubject<number>(0);
    hint = computed(() =>
        this.currencyAccounts().length
            ? `Accounts: ${this.currencyAccounts()
                  .map((a) => `#${a}`)
                  .join(', ')}`
            : 'No accounts',
    );

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

    hasMissingAccounts = computed(
        () =>
            this.currencyAccounts().length < this.accountsNumber() + this.optionalAccountsNumber(),
    );

    constructor() {
        this.control.valueChanges.pipe(takeUntilDestroyed(this.dr)).subscribe((currency) => {
            const normalizedCurrency = currency?.toUpperCase();
            if (currency !== normalizedCurrency) {
                this.control.setValue(normalizedCurrency, { emitEvent: false });
            }
            this.currency.set(normalizedCurrency);
        });

        effect(() => {
            const currency = this.currency();
            const disabled = this.disabled();
            untracked(() => {
                if (currency !== this.control.value) {
                    this.control.setValue(currency, { emitEvent: false });
                }
                if (disabled !== this.control.disabled) {
                    if (disabled) {
                        this.control.disable({ emitEvent: false });
                    } else {
                        this.control.enable({ emitEvent: false });
                    }
                }
            });
        });

        effect((onCleanup) => {
            const currency = this.currency();
            const currentValue = untracked(this.value);
            if (
                !this.control.dirty ||
                !CURRENCY_CODE_PATTERN.test(currency) ||
                currentValue?.currency !== currency ||
                currentValue.accounts.length
            ) {
                return;
            }
            const subscription = untracked(() => this.createAccounts(currency)).subscribe(
                (accounts) => {
                    this.setAccounts(currency, accounts);
                },
            );
            onCleanup(() => subscription.unsubscribe());
        });
    }

    markAsTouched() {
        this.touch.emit();
    }

    generate(currency = this.currency()) {
        this.createAccounts(currency)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((accounts) => {
                this.setAccounts(currency, accounts);
            });
    }

    private setAccounts(currency: string, accounts: number[] = []) {
        this.value.set({ currency, accounts });
    }

    private createAccounts(currency: string) {
        if (!currency || currency.length !== 3) {
            return of([] as number[]);
        }
        const currentAccounts = this.currencyAccounts();
        const currentAccountsCount = currentAccounts.length;

        const isReplace =
            currentAccountsCount === this.accountsNumber() + this.optionalAccountsNumber();
        const newAccountsCount = isReplace
            ? this.accountsNumber()
            : currentAccountsCount === this.accountsNumber()
              ? this.optionalAccountsNumber()
              : this.accountsNumber() - currentAccountsCount;

        return combineLatest(
            new Array(newAccountsCount).fill(null).map((_, idx) =>
                this.accountManagementService
                    .CreateAccount({
                        currency_sym_code: currency,
                    })
                    .pipe(
                        progressTo(this.progress$),
                        catchError((err) => {
                            this.log.error(
                                err,
                                this.accountsNumber() > 1
                                    ? `Failed to create account #${idx + 1} with ${currency} currency`
                                    : `Failed to create account with ${currency} currency`,
                            );
                            return of(null);
                        }),
                    ),
            ),
        ).pipe(
            map((accounts) => accounts.filter(Boolean)),
            map((accounts) => (isReplace ? accounts : [...currentAccounts, ...accounts])),
        );
    }
}
