import {
    AfterViewInit,
    Component,
    DestroyRef,
    Input,
    booleanAttribute,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PartyID } from '@vality/domain-proto/domain';
import {
    FormControlSuperclass,
    NotifyLogService,
    Option,
    SelectFieldComponent,
    createControlProviders,
    debounceTimeWithFirst,
    getValueChanges,
} from '@vality/matez';
import { BehaviorSubject, Observable, ReplaySubject, Subject, merge, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { DeanonimusService } from '../../../api/deanonimus/deanonimus.service';
import { DEBOUNCE_TIME_MS } from '../../../tokens';

@Component({
    selector: 'cc-merchant-field',
    templateUrl: 'merchant-field.component.html',
    providers: createControlProviders(() => MerchantFieldComponent),
    standalone: false,
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
