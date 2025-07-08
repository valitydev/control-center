import { inject } from '@angular/core';
import { createColumn } from '@vality/matez';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { ShopCardComponent } from '../../components/shop-card/shop-card.component';
import { SidenavInfoService } from '../../components/sidenav-info';

export const createShopColumn = createColumn(
    ({ shopId, ...params }: { shopId: string; shopName?: string }) => {
        const name$ =
            'shopName' in params
                ? of(params.shopName)
                : inject(PartiesStoreService)
                      .getShop(shopId)
                      .pipe(map((shop) => shop.details.name));
        const sidenavInfoService = inject(SidenavInfoService);
        const shopCell = {
            description: shopId,
            click: () => {
                sidenavInfoService.toggle(ShopCardComponent, { id: shopId });
            },
        };
        return name$.pipe(
            map((shopName) => ({
                ...shopCell,
                value: shopName,
            })),
            startWith({
                ...shopCell,
                inProgress: true,
            }),
        );
    },
    { header: 'Shop' },
);
