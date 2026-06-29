import { first, map, switchMap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DialogService, UpdateOptions } from '@vality/matez';

import { PartiesStoreService } from '~/api/payment-processing';
import { CreateShopDialogComponent } from '~/components/create-shop-dialog';

import { PartyStoreService } from '../../party/party-store.service';

@Component({
    templateUrl: 'shops.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class PartyShopsComponent {
    private partiesStoreService = inject(PartiesStoreService);
    private partyStoreService = inject(PartyStoreService);
    private dialog = inject(DialogService);

    shopsResource$ = this.partyStoreService.party$.pipe(
        map((party) => this.partiesStoreService.getPartyShops(party.ref.id)),
    );
    shops$ = this.shopsResource$.pipe(switchMap((res) => res.value$));
    progress$ = this.shopsResource$.pipe(switchMap((res) => res.isLoading$));

    reload(_options: UpdateOptions) {
        this.partiesStoreService.reloadShops();
    }

    create() {
        this.partyStoreService.party$
            .pipe(
                first(),
                switchMap((party) =>
                    this.dialog
                        .open(CreateShopDialogComponent, { partyId: party.ref.id })
                        .afterClosed(),
                ),
            )
            .subscribe((res) => {
                if (res?.status === 'success') {
                    this.partiesStoreService.reloadShops();
                }
            });
    }
}
