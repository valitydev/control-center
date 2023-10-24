import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SearchShopHit } from '@vality/deanonimus-proto/internal/deanonimus';
import { Column, progressTo, QueryParamsService } from '@vality/ng-core';
import { BehaviorSubject, defer, merge, of } from 'rxjs';
import { startWith, switchMap, map, shareReplay, debounceTime } from 'rxjs/operators';

import { DeanonimusService } from '../../api/deanonimus';

@UntilDestroy()
@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
})
export class ShopsComponent implements OnInit {
    searchControl = new FormControl(this.qp.params.search);
    shops$ = merge(
        this.searchControl.valueChanges,
        defer(() => this.updateShops$),
    ).pipe(
        startWith(null),
        debounceTime(200),
        map(() => this.searchControl.value),
        switchMap((search) =>
            search
                ? this.deanonimusService
                      .searchShopText(search.trim())
                      .pipe(progressTo(this.progress$))
                : of<SearchShopHit[]>([]),
        ),
        map((hits) => hits.map((h) => h.shop)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columns: Column<SearchShopHit>[] = [{ field: 'shop.details.name', description: 'shop.id' }];
    progress$ = new BehaviorSubject(0);

    private updateShops$ = new BehaviorSubject<void>(undefined);

    constructor(
        private deanonimusService: DeanonimusService,
        private qp: QueryParamsService<{ search: string }>,
    ) {}

    ngOnInit() {
        this.searchControl.valueChanges
            .pipe(startWith(this.searchControl.value), untilDestroyed(this))
            .subscribe((search) => {
                this.qp.set({ search });
            });
    }

    update() {
        this.updateShops$.next();
    }
}
