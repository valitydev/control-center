import {
    Component,
    Input,
    AfterViewInit,
    booleanAttribute,
    DestroyRef,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PartyID } from '@vality/domain-proto/domain';
import {
    Option,
    NotifyLogService,
    FormControlSuperclass,
    createControlProviders,
    getValueChanges,
    debounceTimeWithFirst,
    SelectFieldComponent,
} from '@vality/matez';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject, merge } from 'rxjs';
import { catchError, map, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';

import { DEBOUNCE_TIME_MS } from '../../../tokens';

@Component({
    selector: 'cc-merchant-field',
    templateUrl: 'merchant-field.component.html',
    providers: createControlProviders(() => MerchantFieldComponent),
})
export class MerchantFieldComponent
    extends FormControlSuperclass<PartyID>
    implements AfterViewInit
{
    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;

    options$ = new ReplaySubject<Option<PartyID>[]>(1);
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

    private searchOptions(str: string): Observable<Option<PartyID>[]> {
        if (!str) {
            return of([]);
        }
        return this.deanonimusService.searchParty(str).pipe(
            map((parties) =>
                parties.map((p) => ({
                    label: p.party.email,
                    value: p.party.id,
                    description: p.party.id,
                })),
            ),
            catchError((err) => {
                this.log.error(err, 'Search error');
                return of([]);
            }),
        );
    }
}
