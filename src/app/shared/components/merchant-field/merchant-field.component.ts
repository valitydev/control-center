import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WrappedFormControlSuperclass, provideValueAccessor } from '@s-libs/ng-core';
import { PartyID } from '@vality/domain-proto';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import {
    catchError,
    debounceTime,
    filter,
    map,
    startWith,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { Option } from '@cc/components/select-search-field';
import { progressTo } from '@cc/utils/operators';

import { DeanonimusService } from '../../../thrift-services/deanonimus';

@UntilDestroy()
@Component({
    selector: 'cc-merchant-field',
    templateUrl: 'merchant-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideValueAccessor(MerchantFieldComponent)],
})
export class MerchantFieldComponent extends WrappedFormControlSuperclass<PartyID>
    implements OnInit {
    @Input() label: string;
    @Input() @coerceBoolean required: boolean;

    control = new FormControl<PartyID>();
    incomingValue$ = new Subject<Partial<PartyID>>();
    options$ = new ReplaySubject<Option<PartyID>[]>(1);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private deanonimusService: DeanonimusService,
        private snackBar: MatSnackBar
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.incomingValue$
            .pipe(
                withLatestFrom(this.options$.pipe(startWith<Option<PartyID>[]>([]))),
                switchMap(([value, options]) => {
                    if (!value) return of<PartyID>(null);
                    const v = options.find((o) => o.value === value);
                    if (v) return of(v.value);
                    return this.searchOptions(value).pipe(
                        tap((options) => this.options$.next(options)),
                        map(
                            (options) =>
                                options?.find((o) => o.value === this.control.value)?.value || null
                        )
                    );
                }),
                untilDestroyed(this)
            )
            .subscribe((v) => this.control.setValue(v));
        this.control.valueChanges.subscribe((v) => this.emitOutgoingValue(v));
        this.searchChange$
            .pipe(
                filter(Boolean),
                debounceTime(600),
                switchMap((str) => this.searchOptions(str)),
                untilDestroyed(this)
            )
            .subscribe((options) => this.options$.next(options));
    }

    handleIncomingValue(partyId: PartyID): void {
        this.control.setValue(partyId);
        this.incomingValue$.next(partyId);
    }

    private searchOptions(str: string): Observable<Option<PartyID>[]> {
        return this.deanonimusService.searchParty(str).pipe(
            map((parties) => parties.map((p) => ({ label: p.party.email, value: p.party.id }))),
            progressTo(this.progress$),
            catchError((err) => {
                this.snackBar.open('Search error', 'OK', { duration: 2000 });
                console.error(err);
                return of([]);
            })
        );
    }
}
