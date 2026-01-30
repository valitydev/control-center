import { map } from 'rxjs/operators';

import { Component, inject } from '@angular/core';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { PageLayoutModule } from '~/components/page-layout';
import { WalletsTableComponent } from '~/components/wallets-table';

import { PartyStoreService } from '../parties/party';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [PartyStoreService],
    imports: [PageLayoutModule, WalletsTableComponent],
})
export class WalletsComponent {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private partyStoreService = inject(PartyStoreService);

    wallets = this.domainObjectsStoreService
        .getObjects('wallet_config')
        .map((wallets) =>
            this.partyStoreService.id$.pipe(
                map((id) =>
                    id
                        ? wallets.filter((w) => w.object.wallet_config.data.party_ref.id === id)
                        : wallets,
                ),
            ),
        );
}
