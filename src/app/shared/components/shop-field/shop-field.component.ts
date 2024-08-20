import {
    Component,
    Input,
    booleanAttribute,
    DestroyRef,
    inject,
    AfterViewInit,
    input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PartyID, Shop, Party } from '@vality/domain-proto/internal/domain';
import { ShopID } from '@vality/domain-proto/payment_processing';
import {
    createControlProviders,
    FormControlSuperclass,
    getValueChanges,
    debounceTimeWithFirst,
    Option,
    NotifyLogService,
} from '@vality/ng-core';
import { BehaviorSubject, of, Observable, ReplaySubject, Subject, concat } from 'rxjs';
import { map, switchMap, distinctUntilChanged, tap, catchError, first } from 'rxjs/operators';

import { DeanonimusService } from '../../../api/deanonimus';
import { PartyManagementService } from '../../../api/payment-processing';
import { DEBOUNCE_TIME_MS } from '../../../tokens';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    providers: createControlProviders(() => ShopFieldComponent),
})
export class ShopFieldComponent
    extends FormControlSuperclass<ShopID | ShopID[]>
    implements AfterViewInit
{
    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: string;
    @Input() appearance?: string;
    @Input() hint?: string;
    @Input({ transform: booleanAttribute }) multiple = false;
    partyId = input<PartyID>();

    options$ = new ReplaySubject<Option<ShopID>[]>(1);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(false);

    private debounceTimeMs = inject(DEBOUNCE_TIME_MS);

    constructor(
        private partyManagementService: PartyManagementService,
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngAfterViewInit() {
        concat(
            getValueChanges(this.control).pipe(
                first(),
                switchMap((term) =>
                    Array.isArray(term)
                        ? of(
                              term.map((id) => ({
                                  label: `#${id}`,
                                  value: id,
                              })),
                          )
                        : this.searchOptions(term),
                ),
            ),
            this.searchChange$.pipe(
                distinctUntilChanged(),
                tap(() => {
                    this.options$.next([]);
                    this.progress$.next(true);
                }),
                debounceTimeWithFirst(this.debounceTimeMs),
                switchMap((term) => this.searchOptions(term)),
            ),
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((options) => {
                this.options$.next(options);
                this.progress$.next(false);
            });
    }

    private searchOptions(str: string): Observable<Option<ShopID>[]> {
        if (!str) {
            return of([]);
        }
        return (
            (this.partyId
                ? this.partyManagementService
                      .Get(this.partyId())
                      .pipe(
                          map((party) =>
                              Array.from(party.shops.values()).map((shop) => ({ party, shop })),
                          ),
                      )
                : this.deanonimusService.searchShopText(str)) as Observable<
                {
                    shop: Shop;
                    party: Party;
                }[]
            >
        ).pipe(
            map((partyShops) =>
                partyShops.map((p) => ({
                    label: p.shop.details.name,
                    value: p.shop.id,
                    description: p.shop.id,
                })),
            ),
            catchError((err) => {
                this.log.error(err, 'Search error');
                return of([]);
            }),
        );
    }
}
