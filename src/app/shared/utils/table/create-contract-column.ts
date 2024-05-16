import { inject } from '@angular/core';
import { ContractID, PartyID, ShopID } from '@vality/domain-proto/domain';
import { Column, PossiblyAsync, getPossiblyAsyncObservable } from '@vality/ng-core';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

import { ShopContractCardComponent } from '../../components/shop-contract-card/shop-contract-card.component';
import { SidenavInfoService } from '../../components/sidenav-info';

export function createContractColumn<T extends object>(
    selectContractId: (d: T) => PossiblyAsync<ContractID>,
    selectPartyId: (d: T) => PossiblyAsync<PartyID>,
    selectShopId: (d: T) => PossiblyAsync<ShopID>,
): Column<T> {
    const sidenavInfoService = inject(SidenavInfoService);

    return {
        field: 'contract',
        header: 'Contract',
        formatter: selectContractId,
        click: (d) => {
            combineLatest([
                getPossiblyAsyncObservable(selectPartyId(d)),
                getPossiblyAsyncObservable(selectShopId(d)),
            ])
                .pipe(take(1))
                .subscribe(([partyId, id]) => {
                    sidenavInfoService.toggle(ShopContractCardComponent, {
                        partyId,
                        id,
                    });
                });
        },
    };
}
