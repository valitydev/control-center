import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { debounceTime, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyShopsComponent {
    filterControl = new FormControl('');
    shopsParty$ = combineLatest([
        this.partyShopsService.shops$,
        this.filterControl.valueChanges.pipe(
            startWith(this.filterControl.value),
            debounceTime(200),
        ),
    ]).pipe(
        map(([shops, searchStr]) =>
            searchStr
                ? shops.filter((s) =>
                      JSON.stringify(s).toLowerCase().includes(searchStr.toLowerCase()),
                  )
                : shops,
        ),
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
