import { inject } from '@angular/core';
import { createColumn } from '@vality/ng-core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { ShopCardComponent } from '../../components/shop-card/shop-card.component';
import { SidenavInfoService } from '../../components/sidenav-info';

export const createWalletColumn = createColumn(
    ({ id, partyId, ...params }: { id: string; partyId: string; name?: string }) => {
        const shopName$ =
            'name' in params
                ? of(params.name)
                : inject(PartiesStoreService)
                      .get(partyId)
                      .pipe(map((party) => party.wallets.get(id).name));
        const sidenavInfoService = inject(SidenavInfoService);
        return shopName$.pipe(
            map((name) => ({
                value: name,
                description: id,
                click: () => {
                    sidenavInfoService.toggle(ShopCardComponent, { id, partyId });
                },
            })),
        );
    },
    'Wallet',
);
