import { ChangeDetectionStrategy, Component } from '@angular/core';
import { withLatestFrom } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyShopsComponent {
    shopsParty$ = this.partyShopsService.shops$.pipe(
        withLatestFrom(this.partyShopsService.party$),
        map(([shops, party]) => shops.map((shop) => ({ shop, party }))),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    progress$ = this.partyShopsService.progress$;

    constructor(private partyShopsService: PartyShopsService) {}

    update() {
        this.partyShopsService.reload();
    }
}
