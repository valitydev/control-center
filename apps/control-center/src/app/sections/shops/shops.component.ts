import { Component, inject } from '@angular/core';
import { Deanonimus, SearchShopHit } from '@vality/deanonimus-proto/deanonimus';
import { NotifyLogService, progressTo } from '@vality/matez';
import { BehaviorSubject, Observable, Subject, combineLatest, defer, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    shareReplay,
    switchMap,
} from 'rxjs/operators';

import { ShopParty } from '../../shared/components/shops-table';

@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
    standalone: false,
})
export class ShopsComponent {
    private deanonimusService = inject(Deanonimus);
    private log = inject(NotifyLogService);
    filterChange$ = new Subject<string>();
    shopsParty$: Observable<ShopParty[]> = combineLatest([
        this.filterChange$.pipe(distinctUntilChanged(), debounceTime(500)),
        defer(() => this.updateShops$),
    ]).pipe(
        switchMap(([search]) =>
            search
                ? this.deanonimusService.searchShopText(search.trim()).pipe(
                      progressTo(this.progress$),
                      catchError((err) => {
                          this.log.error(err);
                          return of<SearchShopHit[]>([]);
                      }),
                  )
                : of<SearchShopHit[]>([]),
        ),
        map((shops) =>
            shops.map(({ shop, party }) => ({
                shop: shop as ShopParty['shop'],
                party,
            })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    progress$ = new BehaviorSubject(0);

    private updateShops$ = new BehaviorSubject<void>(undefined);

    update() {
        this.updateShops$.next();
    }
}
