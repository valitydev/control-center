import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyShopsComponent {
    shopsParty$ = this.partyShopsService.shops$;
    progress$ = this.partyShopsService.progress$;

    constructor(private partyShopsService: PartyShopsService) {}

    update() {
        this.partyShopsService.reload();
    }
}
