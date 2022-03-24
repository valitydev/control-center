import { Injectable } from '@angular/core';
import { ContractID, PartyID, ShopID } from '@vality/domain-proto';
import { switchMap } from 'rxjs';

import { PartyManagementService, UserInfoService } from '@cc/app/api/payment-processing';

@Injectable({
    providedIn: 'root',
})
export class PartyManagementWithUserService {
    constructor(
        private partyManagementService: PartyManagementService,
        private userInfoService: UserInfoService
    ) {}

    getParty(partyId: PartyID) {
        return this.userInfoService
            .getUserInfo()
            .pipe(switchMap((userInfo) => this.partyManagementService.Get(userInfo, partyId)));
    }

    getShop(partyId: PartyID, id: ShopID) {
        return this.userInfoService
            .getUserInfo()
            .pipe(
                switchMap((userInfo) => this.partyManagementService.GetShop(userInfo, partyId, id))
            );
    }

    getContract(partyId: PartyID, id: ContractID) {
        return this.userInfoService
            .getUserInfo()
            .pipe(
                switchMap((userInfo) =>
                    this.partyManagementService.GetContract(userInfo, partyId, id)
                )
            );
    }
}
