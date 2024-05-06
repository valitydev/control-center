import {
    Component,
    Input,
    AfterViewInit,
    booleanAttribute,
    DestroyRef,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletID } from '@vality/domain-proto/domain';
import {
    Option,
    NotifyLogService,
    FormControlSuperclass,
    createControlProviders,
    getValueChanges,
    debounceTimeWithFirst,
} from '@vality/ng-core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject, merge } from 'rxjs';
import { catchError, map, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';

import { DEBOUNCE_TIME_MS } from '../../../tokens';

@Component({
    selector: 'cc-wallet-field',
    templateUrl: 'wallet-field.component.html',
    providers: createControlProviders(() => WalletFieldComponent),
})
export class WalletFieldComponent extends FormControlSuperclass<WalletID> implements AfterViewInit {
    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: string;
    @Input() appearance?: string;
    @Input() hint?: string;

    options$ = new ReplaySubject<Option<WalletID>[]>(1);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(false);

    private debounceTimeMs = inject(DEBOUNCE_TIME_MS);

    constructor(
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngAfterViewInit() {
        merge(getValueChanges(this.control), this.searchChange$)
            .pipe(
                distinctUntilChanged(),
                tap(() => {
                    this.options$.next([]);
                    this.progress$.next(true);
                }),
                debounceTimeWithFirst(this.debounceTimeMs),
                switchMap((term) => this.searchOptions(term)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((options) => {
                this.options$.next(options);
                this.progress$.next(false);
            });
    }

    private searchOptions(str: string): Observable<Option<WalletID>[]> {
        if (!str) {
            return of([]);
        }
        return this.deanonimusService.searchWalletText(str).pipe(
            map((wallets) =>
                wallets.map((p) => ({
                    label: p.wallet.name,
                    value: p.wallet.id,
                    description: p.wallet.id,
                })),
            ),
            catchError((err) => {
                this.log.error(err, 'Search error');
                return of([]);
            }),
        );
    }
}
