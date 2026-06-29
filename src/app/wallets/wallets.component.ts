import { first, map, switchMap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { DialogService } from '@vality/matez';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { CreateWalletDialogComponent } from '~/components/create-wallet-dialog';
import { PageLayoutModule } from '~/components/page-layout';
import { WalletsTableComponent } from '~/components/wallets-table';

import { PartyStoreService } from '../parties/party';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [PartyStoreService],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButtonModule, PageLayoutModule, WalletsTableComponent],
})
export class WalletsComponent {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private partyStoreService = inject(PartyStoreService);
    private dialog = inject(DialogService);

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

    create() {
        this.partyStoreService.id$
            .pipe(
                first(),
                switchMap((partyId) =>
                    this.dialog
                        .open(CreateWalletDialogComponent, partyId ? { partyId } : undefined)
                        .afterClosed(),
                ),
            )
            .subscribe((res) => {
                if (res?.status === 'success') {
                    this.wallets.reload();
                }
            });
    }
}
