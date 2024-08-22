import {
    Component,
    Input,
    booleanAttribute,
    DestroyRef,
    inject,
    AfterViewInit,
    input,
    Injector,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { PartyID, Shop, Party } from '@vality/domain-proto/internal/domain';
import { ShopID } from '@vality/domain-proto/payment_processing';
import {
    createControlProviders,
    FormControlSuperclass,
    debounceTimeWithFirst,
    Option,
    NotifyLogService,
} from '@vality/ng-core';
import { BehaviorSubject, of, ReplaySubject, Subject, combineLatest } from 'rxjs';
import { map, switchMap, distinctUntilChanged, tap, catchError, startWith } from 'rxjs/operators';

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
        private dr: DestroyRef,
        private injector: Injector,
    ) {
        super();
    }

    ngAfterViewInit() {
        combineLatest([
            this.searchChange$.pipe(
                startWith(
                    ...(Array.isArray(this.control.value)
                        ? this.control.value
                        : [this.control.value ?? '']),
                ),
                distinctUntilChanged(),
            ),
            toObservable(this.partyId, { injector: this.injector }).pipe(
                switchMap((partyId) =>
                    partyId ? this.partyManagementService.Get(partyId) : of(null),
                ),
            ),
        ])
            .pipe(
                debounceTimeWithFirst(this.debounceTimeMs),
                tap(() => {
                    this.options$.next([]);
                    this.progress$.next(true);
                }),
                switchMap(([term, party]) =>
                    party ? of(this.searchShopsByParty(party, term)) : this.searchShops(term),
                ),
                tap(() => this.progress$.next(false)),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((options) => {
                this.options$.next(options);
            });
    }

    private searchShops(search: string) {
        return this.deanonimusService.searchShopText(search).pipe(
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

    private searchShopsByParty(party: Party, search: string) {
        const searchStr = search.trim().toLowerCase();
        return Array.from(party.shops.values())
            .map((shop) => ({ party, shop }))
            .sort(
                (a, b) =>
                    +this.includeSearchStr(a, searchStr) - +this.includeSearchStr(b, searchStr),
            )
            .map((p) => ({
                label: p.shop.details.name,
                value: p.shop.id,
                description: p.shop.id,
            }));
    }

    private includeSearchStr({ shop, party }: { party: Party; shop: Shop }, searchStr: string) {
        return [shop.id, shop.details.name, party.id, party.party_name].some((v) =>
            String(v ?? '')
                .toLowerCase()
                .includes(searchStr),
        );
    }
}
