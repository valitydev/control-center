import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
    AutocompleteFieldModule,
    FormComponentSuperclass,
    NotifyLogService,
    Option,
    compareDifferentTypes,
    createControlProviders,
    getValueChanges,
    progressTo,
    switchCombineWith,
} from '@vality/matez';

import { CurrenciesStoreService } from '~/api/domain-config';
import { ThriftAccountManagementService } from '~/api/services';

export interface CurrencyAccount {
    currency: string;
    accounts: number[];
}

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
    providers: createControlProviders(() => AccountFieldComponent),
})
export class AccountFieldComponent
    extends FormComponentSuperclass<CurrencyAccount>
    implements OnInit
{
    private currenciesStoreService = inject(CurrenciesStoreService);
    private accountManagementService = inject(ThriftAccountManagementService);
    private dr = inject(DestroyRef);
    private log = inject(NotifyLogService);

    control = new FormControl<string>(null, { nonNullable: true });

    label = input('Account currency');
    accountsNumber = input(1);
    optionalAccountsNumber = input(0);

    currencyAccounts = signal<number[]>([]);
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

    noCurrencyAccount$ = combineLatest([
        toObservable(this.currencyAccounts),
        toObservable(this.accountsNumber),
        toObservable(this.optionalAccountsNumber),
    ]).pipe(
        map(
            ([accounts, accountsNumber, optionalAccountsNumber]) =>
                accounts.length < accountsNumber + optionalAccountsNumber,
        ),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    override ngOnInit() {
        super.ngOnInit();
        getValueChanges(this.control)
            .pipe(
                distinctUntilChanged(),
                tap((currency) => {
                    this.setAccounts(currency);
                }),
                switchCombineWith((currency) => [this.createAccounts(currency)]),
                takeUntilDestroyed(this.dr),
            )
            .subscribe(([currency, accounts]) => {
                this.setAccounts(currency, accounts);
            });
    }

    override handleIncomingValue(value: CurrencyAccount) {
        this.currencyAccounts.set(value?.accounts || []);
        this.control.setValue(value?.currency);
    }

    generate(currency = this.control.value) {
        this.createAccounts(currency)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((accounts) => {
                this.setAccounts(currency, accounts);
            });
    }

    private setAccounts(currency: string, accounts: number[] = []) {
        this.currencyAccounts.set(accounts);
        this.emitOutgoingValue({ currency, accounts });
    }

    private createAccounts(currency: string) {
        if (!currency || currency.length !== 3) {
            return of([] as number[]);
        }

        return combineLatest(
            new Array(
                this.currencyAccounts().length === this.accountsNumber()
                    ? this.accountsNumber() + this.optionalAccountsNumber()
                    : this.accountsNumber(),
            )
                .fill(null)
                .map((_, idx) =>
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
                                throw err;
                            }),
                        ),
                ),
        );
    }
}
