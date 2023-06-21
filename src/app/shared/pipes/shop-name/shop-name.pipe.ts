import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, map, pluck, switchMap, takeUntil } from 'rxjs/operators';

import { PartiesStoreService } from '@cc/app/api/payment-processing';

@Pipe({
    name: 'shopName',
    pure: false,
})
export class ShopNamePipe implements PipeTransform, OnDestroy {
    private shopName$ = new BehaviorSubject<string>('');
    private shopIDChange$ = new Subject<string>();
    private partyIDChange$ = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        private partyManagementService: PartiesStoreService,
        private ref: ChangeDetectorRef
    ) {
        combineLatest([
            this.partyIDChange$.pipe(
                distinctUntilChanged(),
                switchMap((id) => this.partyManagementService.get(id)),
                map(({ shops }) => Array.from(shops.values()))
            ),
            this.shopIDChange$.pipe(distinctUntilChanged()),
        ])
            .pipe(
                takeUntil(this.destroy$),
                map(([shops, shopID]) => shops.find((s) => s.id === shopID)),
                pluck('details', 'name')
            )
            .subscribe((v) => {
                this.shopName$.next(v);
                this.ref.markForCheck();
            });
    }

    transform(shopID: string, partyID: string): string {
        this.shopIDChange$.next(shopID);
        this.partyIDChange$.next(partyID);
        return this.shopName$.value;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }
}
