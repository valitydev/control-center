import { shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
    DomainObjectType,
    ShopConfig,
    TermSetHierarchy,
    TermSetHierarchyRef,
} from '@vality/domain-proto/domain';
import { CommonSearchQueryParams, ShopSearchQuery } from '@vality/dominator-proto/dominator';
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
import { ShopFieldModule } from '~/components/shop-field';
import { SidenavInfoService } from '~/components/sidenav-info';
import { createDomainObjectColumn, createPartyColumn, createShopColumn } from '~/utils';

import { getDomainObjectsTerms } from '../../utils/get-domain-objects-terms';
import { FlatDecision, getFlatDecisions } from '../../utils/get-flat-decisions';

import {
    SHOP_FEES_COLUMNS,
    getShopCashFlowSelectors,
    isShopTermSetDecision,
} from './utils/shop-fees-columns';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<ShopSearchQuery, 'common_search_query_params'>,
        { term_sets_ids?: TermSetHierarchyRef['id'][] }
    >;

@Component({
    selector: 'cc-shops-terms',
    imports: [
        CommonModule,
        PageLayoutModule,
        TableModule,
        InputFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        ShopFieldModule,
        ListFieldModule,
    ],
    templateUrl: './shops-terms.component.html',
})
export class ShopsTermsComponent {
    private sidenavInfoService = inject(SidenavInfoService);

    shopTerms = getDomainObjectsTerms(DomainObjectType.shop_config);

    terms$ = this.shopTerms.value$.pipe(
        cachedHeadMap((t) => ({
            value: {
                id: t.object.object.shop_config.ref.id,
                shop: t.object.object.shop_config.data,
                terms: t.terms?.object?.term_set_hierarchy?.data,
            },
            children: getFlatDecisions(
                getShopCashFlowSelectors(t.terms?.object?.term_set_hierarchy),
            ).filter((v) =>
                isShopTermSetDecision(v, {
                    partyId: t.object.object.shop_config.data.party_ref.id,
                    shopId: t.object.object.shop_config.ref.id,
                    currency: t.object.object.shop_config.data.account.currency.symbolic_code,
                }),
            ),
        })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columns: Column<{ id: string; shop: ShopConfig; terms: TermSetHierarchy }, FlatDecision>[] = [
        createShopColumn(
            (d) => ({
                shopId: d.id,
                partyId: d.shop?.party_ref?.id,
                shopName: d.shop?.name,
            }),
            { sticky: 'start' },
        ),
        createPartyColumn((d) => ({ id: d.shop?.party_ref?.id })),
        { field: 'currency', cell: (d) => ({ value: d.shop?.account?.currency?.symbolic_code }) },
        createDomainObjectColumn(
            (d) => ({ ref: { term_set_hierarchy: { id: d.shop?.terms?.id } } }),
            { header: 'Term Set' },
        ),
        ...SHOP_FEES_COLUMNS,
        // {
        //     field: 'term_set_history',
        //     cell: (d) => ({
        //         value: d.term_set_history?.length || '',
        //         click: () =>
        //             this.sidenavInfoService.open(ShopsTermSetHistoryCardComponent, { data: d }),
        //     }),
        // },
    ];
}
