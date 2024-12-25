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
    debounceTimeWithFirst,
    progressTo,
    SelectFieldComponent,
} from '@vality/matez';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject, concat, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';

import { DEBOUNCE_TIME_MS } from '../../../tokens';

@Component({
    selector: 'cc-wallet-field',
    templateUrl: 'wallet-field.component.html',
    providers: createControlProviders(() => WalletFieldComponent),
})
export class WalletFieldComponent
    extends FormControlSuperclass<WalletID | WalletID[]>
    implements AfterViewInit
{
    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    @Input({ transform: booleanAttribute }) multiple = false;

    options$ = new ReplaySubject<Option<WalletID>[]>(1);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(0);

    private debounceTimeMs = inject(DEBOUNCE_TIME_MS);

    constructor(
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngAfterViewInit() {
        concat(
            of(this.control.value).pipe(
                switchMap((term) =>
                    forkJoin(
                        (Array.isArray(term) ? term : [term ?? '']).map((t) => this.findOption(t)),
                    ),
                ),
                map((o) => o.filter(Boolean)),
            ),
            this.searchChange$.pipe(
                distinctUntilChanged(),
                tap(() => {
                    this.options$.next([]);
                }),
                debounceTimeWithFirst(this.debounceTimeMs),
                switchMap((term) => this.searchOptions(term)),
            ),
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((options) => {
                this.options$.next(options);
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
            progressTo(this.progress$),
        );
    }

    private findOption(id: WalletID) {
        return this.searchOptions(id).pipe(
            map((options) => (options?.length ? options.find((o) => o.value === id) : null)),
        );
    }
}
