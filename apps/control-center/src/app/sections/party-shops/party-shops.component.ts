import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable, withLatestFrom } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ShopParty } from '../../shared/components/shops-table';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class PartyShopsComponent {
    private partyShopsService = inject(PartyShopsService);
    shopsParty$: Observable<ShopParty[]> = this.partyShopsService.shops$.pipe(
        withLatestFrom(this.partyShopsService.party$),
        map(([shops, party]) =>
            shops.map((shop) => ({
                shop,
                party: { id: party.id, email: party.contact_info?.registration_email },
            })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    progress$ = this.partyShopsService.progress$;

    update() {
        this.partyShopsService.reload();
    }
}
