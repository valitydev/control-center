import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { metadata$ } from '@vality/fistful-proto';
import { DepositStatus } from '@vality/fistful-proto/fistful_stat';
import { formatCurrency } from '@vality/matez';
import {
    ThriftViewExtension,
    ThriftViewExtensionResult,
    getUnionKey,
    getUnionValue,
    isTypeWithAliases,
} from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { AmountCurrencyService } from '~/services';

import { FetchSourcesService } from '../../sources';

import { ReceiveDepositService } from './services/receive-deposit/receive-deposit.service';


@Component({
    templateUrl: 'deposit-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ReceiveDepositService],
    standalone: false,
})
export class DepositDetailsComponent implements OnInit {
    private fetchDepositService = inject(ReceiveDepositService);
    private route = inject(ActivatedRoute);
    private _locale = inject<string>(LOCALE_ID);
    private amountCurrencyService = inject(AmountCurrencyService);
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private fetchSourcesService = inject(FetchSourcesService);

    deposit$ = this.fetchDepositService.deposit$;
    isLoading$ = this.fetchDepositService.isLoading$;
    metadata$ = metadata$;
    extensions$: Observable<ThriftViewExtension[]> = this.fetchDepositService.deposit$.pipe(
        map((deposit) => [
            {
                determinant: (d) => of(isTypeWithAliases(d, 'Timestamp', 'base')),
                extension: (_, value: string) =>
                    of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
            },
            {
                determinant: (d) =>
                    of(isTypeWithAliases(d, 'CurrencySymbolicCode', 'fistful_stat')),
                extension: () => of({ hidden: true }),
            },
            {
                determinant: (d) => of(isTypeWithAliases(d, 'Amount', 'base')),
                extension: (_, amount: number) =>
                    this.amountCurrencyService.getCurrency(deposit.currency_symbolic_code).pipe(
                        map((c) => ({
                            value: formatCurrency(
                                amount,
                                c.symbolic_code,
                                'long',
                                this._locale,
                                c.exponent,
                            ),
                        })),
                    ),
            },
            {
                determinant: (d) => of(isTypeWithAliases(d, 'DepositStatus', 'fistful_stat')),
                extension: (_, status: DepositStatus) =>
                    of({
                        value: startCase(getUnionKey(status)),
                        tooltip: Object.keys(getUnionValue(status)).length
                            ? getUnionValue(status)
                            : undefined,
                        color: (
                            {
                                failed: 'warn',
                                pending: 'pending',
                                succeeded: 'success',
                            } as const
                        )[getUnionKey(status)],
                    }),
            },
            {
                determinant: (d) => of(isTypeWithAliases(d, 'WalletID', 'fistful_stat')),
                extension: (_, id: string) =>
                    this.domainObjectsStoreService
                        .getLimitedObject({ wallet_config: { id } })
                        .value$.pipe(
                            map(
                                (wallet): ThriftViewExtensionResult => ({
                                    value: wallet.name,
                                    tooltip: id,
                                    link: [
                                        ['/wallets'],
                                        { queryParams: { wallet_id: JSON.stringify([id]) } },
                                    ],
                                }),
                            ),
                        ),
            },
            {
                determinant: (d) => of(isTypeWithAliases(d, 'SourceID', 'fistful_stat')),
                extension: (_, id: string) =>
                    this.fetchSourcesService.sources$.pipe(
                        map((sources) => sources.find((s) => s.id === id)),
                        map(
                            (source): ThriftViewExtensionResult => ({
                                value: source.name,
                                tooltip: source.id,
                            }),
                        ),
                    ),
            },
        ]),
    );

    ngOnInit() {
        this.route.params
            .pipe(
                take(1),
                map((p) => p['depositID']),
            )
            .subscribe((depositID) => this.fetchDepositService.receiveDeposit(depositID));
    }
}
