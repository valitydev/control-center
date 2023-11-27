import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SearchShopHit } from '@vality/deanonimus-proto/internal/deanonimus';
import { Column, progressTo, NotifyLogService } from '@vality/ng-core';
import { BehaviorSubject, defer, of, combineLatest, Subject } from 'rxjs';
import { switchMap, shareReplay, catchError } from 'rxjs/operators';

import { DeanonimusService } from '../../api/deanonimus';

@UntilDestroy()
@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
})
export class ShopsComponent {
    filterChange$ = new Subject<string>();
    shopsParty$ = combineLatest([this.filterChange$, defer(() => this.updateShops$)]).pipe(
        switchMap(([search]) =>
            search
                ? this.deanonimusService.searchShopText(search.trim()).pipe(
                      progressTo(this.progress$),
                      catchError((err) => {
                          this.log.error(err);
                          return of([]);
                      }),
                  )
                : of<SearchShopHit[]>([]),
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
