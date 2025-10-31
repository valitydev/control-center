import { shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { DomainObjectType, TermSetHierarchy, WalletConfig } from '@vality/domain-proto/domain';
import {
    type CommonSearchQueryParams,
    type WalletSearchQuery,
} from '@vality/dominator-proto/dominator';
import {
    Column,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    TableModule,
    cachedHeadMap,
} from '@vality/matez';

import { MerchantFieldModule } from '~/components/merchant-field/merchant-field.module';
import { PageLayoutModule } from '~/components/page-layout';
import { SidenavInfoService } from '~/components/sidenav-info/sidenav-info.service';
import { WalletFieldModule } from '~/components/wallet-field';
import { createDomainObjectColumn, createPartyColumn, createWalletColumn } from '~/utils';

import { getDomainObjectsTerms } from '../../utils/get-domain-objects-terms';
import { FlatDecision, getFlatDecisions } from '../../utils/get-flat-decisions';

import {
    WALLET_FEES_COLUMNS,
    getWalletCashFlowSelectors,
    isWalletTermSetDecision,
} from './utils/wallet-fees-columns';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<WalletSearchQuery, 'common_search_query_params'>,
        {
            term_sets_ids?: WalletSearchQuery['term_sets_ids'][number]['id'][];
            identity_ids?: WalletSearchQuery['identity_ids'][number]['id'][];
        }
    >;

@Component({
    selector: 'cc-wallets-terms',
    imports: [
        CommonModule,
        PageLayoutModule,
        TableModule,
        InputFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        ListFieldModule,
        WalletFieldModule,
    ],
    templateUrl: './wallets-terms.component.html',
})
export class WalletsTermsComponent {
    private sidenavInfoService = inject(SidenavInfoService);

    walletTerms = getDomainObjectsTerms(DomainObjectType.wallet_config);

    terms$ = this.walletTerms.value$.pipe(
        cachedHeadMap((t) => ({
            value: {
                id: t.object.object.wallet_config.ref.id,
                wallet: t.object.object.wallet_config.data,
                terms: t.terms?.object?.term_set_hierarchy?.data,
            },
            children: getFlatDecisions(
                getWalletCashFlowSelectors(t.terms?.object?.term_set_hierarchy),
            ).filter((v) =>
                isWalletTermSetDecision(v, {
                    partyId: t.object.object.wallet_config.data.party_ref.id,
                    walletId: t.object.object.wallet_config.ref.id,
                    currency: t.object.object.wallet_config.data.account.currency.symbolic_code,
                }),
            ),
        })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columns: Column<{ id: string; wallet: WalletConfig; terms: TermSetHierarchy }, FlatDecision>[] =
        [
            createWalletColumn(
                (d) => ({
                    id: d.id,
                    partyId: d.wallet?.party_ref?.id,
                    name: d.wallet?.name,
                }),
                { sticky: 'start' },
            ),
            createPartyColumn((d) => ({ id: d.wallet?.party_ref?.id })),
            {
                field: 'currency',
                cell: (d) => ({ value: d.wallet?.account?.currency?.symbolic_code }),
            },
            createDomainObjectColumn(
                (d) => ({ ref: { term_set_hierarchy: { id: d.wallet?.terms?.id } } }),
                { header: 'Term Set' },
            ),
            ...WALLET_FEES_COLUMNS,
            // {
            //     field: 'term_set_history',
            //     cell: (d) => ({
            //         value: d.term_set_history?.length || '',
            //         click: () =>
            //             this.sidenavInfoService.open(WalletsTermSetHistoryCardComponent, { data: d }),
            //     }),
            // },
        ];
}
