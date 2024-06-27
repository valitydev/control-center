import { inject } from '@angular/core';
import { createColumn } from '@vality/ng-core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { ShopCardComponent } from '../../components/shop-card/shop-card.component';
import { SidenavInfoService } from '../../components/sidenav-info';

export const createShopColumn = createColumn(
    ({ shopId, partyId, ...params }: { shopId: string; partyId: string; shopName?: string }) => {
        const shopName$ =
            'shopName' in params
                ? of(params.shopName)
                : inject(PartiesStoreService)
                      .get(partyId)
                      .pipe(map((party) => party.shops.get(shopId).details.name));
        const sidenavInfoService = inject(SidenavInfoService);
        return shopName$.pipe(
            map((shopName) => ({
                value: shopName,
                description: shopId,
                click: () => {
                    sidenavInfoService.toggle(ShopCardComponent, { id: shopId, partyId });
                },
            })),
        );
    },
    'Shop',
);
