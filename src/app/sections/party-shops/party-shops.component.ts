import { ChangeDetectionStrategy, Component } from '@angular/core';
import { withLatestFrom, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ShopParty } from '../../shared/components/shops-table';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyShopsComponent {
    shopsParty$: Observable<ShopParty[]> = this.partyShopsService.shops$.pipe(
        withLatestFrom(this.partyShopsService.party$),
        map(([shops, party]) =>
            shops.map((shop) => ({
                shop,
                party: { id: party.id, email: party.contact_info?.email },
            })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    progress$ = this.partyShopsService.progress$;

    constructor(private partyShopsService: PartyShopsService) {}

    update() {
        this.partyShopsService.reload();
    }
}
