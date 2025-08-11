import { inject } from '@angular/core';
import { createColumn } from '@vality/matez';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { SidenavInfoService } from '../../app/shared/components/sidenav-info';
import { DomainObjectCardComponent } from '../../app/shared/components/thrift-api-crud/domain';

import { PartiesStoreService } from '~/api/payment-processing';

export const createShopColumn = createColumn(
    ({ shopId, ...params }: { shopId: string; shopName?: string }) => {
        const name$ =
            'shopName' in params
                ? of(params.shopName)
                : inject(PartiesStoreService)
                      .getShop(shopId)
                      .value$.pipe(map((shop) => shop.data.name));
        const sidenavInfoService = inject(SidenavInfoService);
        const shopCell = {
            description: shopId,
            click: () => {
                sidenavInfoService.toggle(DomainObjectCardComponent, {
                    ref: { shop_config: { id: shopId } },
                });
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
