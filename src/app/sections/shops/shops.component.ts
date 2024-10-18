import { Component } from '@angular/core';
import { SearchShopHit } from '@vality/deanonimus-proto/deanonimus';
import { Column, progressTo, NotifyLogService } from '@vality/ng-core';
import { BehaviorSubject, defer, of, combineLatest, Subject, Observable } from 'rxjs';
import {
    switchMap,
    shareReplay,
    catchError,
    map,
    debounceTime,
    distinctUntilChanged,
} from 'rxjs/operators';

import { DeanonimusService } from '../../api/deanonimus';
import { ShopParty } from '../../shared/components/shops-table';

@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
})
export class ShopsComponent {
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
    columns: Column<SearchShopHit>[] = [{ field: 'shop.details.name', description: 'shop.id' }];
    progress$ = new BehaviorSubject(0);

    private updateShops$ = new BehaviorSubject<void>(undefined);

    constructor(
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
    ) {}

    update() {
        this.updateShops$.next();
    }
}
