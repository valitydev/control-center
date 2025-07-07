import {
    AfterViewInit,
    Component,
    DestroyRef,
    Injector,
    Input,
    booleanAttribute,
    inject,
    input,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Deanonimus } from '@vality/deanonimus-proto/deanonimus';
import { Party, PartyID, Shop } from '@vality/domain-proto/domain';
import { PartyManagement, ShopID } from '@vality/domain-proto/payment_processing';
import {
    FormControlSuperclass,
    NotifyLogService,
    Option,
    SelectFieldComponent,
    createControlProviders,
    debounceTimeWithFirst,
    progressTo,
} from '@vality/matez';
import {
    BehaviorSubject,
    Observable,
    Subject,
    asyncScheduler,
    combineLatest,
    concat,
    concatMap,
    of,
    scheduled,
} from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { DEBOUNCE_TIME_MS } from '../../../tokens';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    providers: createControlProviders(() => ShopFieldComponent),
    standalone: false,
})
export class ShopFieldComponent
    extends FormControlSuperclass<ShopID | ShopID[]>
    implements AfterViewInit
{
    private partyManagementService = inject(PartyManagement);
    private deanonimusService = inject(Deanonimus);
    private log = inject(NotifyLogService);
    private dr = inject(DestroyRef);
    private injector = inject(Injector);
    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    @Input({ transform: booleanAttribute }) multiple = false;
    partyId = input<PartyID>();

    options$ = new BehaviorSubject<Option<ShopID>[]>([]);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(0);

    private debounceTimeMs = inject(DEBOUNCE_TIME_MS);

    ngAfterViewInit() {
        const initValues = this.getCurrentValues();
        combineLatest([
            concat(
                scheduled(initValues.length ? initValues : [''], asyncScheduler),
                this.searchChange$.pipe(
                    distinctUntilChanged(),
                    debounceTimeWithFirst(this.debounceTimeMs),
                ),
            ),
            toObservable(this.partyId, { injector: this.injector }).pipe(
                switchMap((partyId) =>
                    partyId
                        ? this.partyManagementService.Get(partyId).pipe(progressTo(this.progress$))
                        : of(null),
                ),
            ),
        ])
            .pipe(
                concatMap(([term, party]) =>
                    party
                        ? of(this.searchShopsByParty(party, term))
                        : this.searchShops(term).pipe(progressTo(this.progress$)),
                ),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((options) => {
                const oldOptions = this.options$.value;
                this.options$.next(
                    this.getCurrentValues().reduce((acc, v) => {
                        if (acc.every((o) => o.value !== v)) {
                            acc.push(
                                oldOptions.find((f) => f.value === v) ?? {
                                    label: `#${v}`,
                                    value: v,
                                    description: v,
                                },
                            );
                        }
                        return acc;
                    }, options),
                );
            });
    }

    private searchShops(search: string): Observable<Option<ShopID>[]> {
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

    private searchShopsByParty(party: Party, search: string): Option<ShopID>[] {
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

    private getCurrentValues() {
        const v = this.control.value;
        return v ? (Array.isArray(v) ? v : [v]) : [];
    }
}
