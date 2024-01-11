import { Component, Input, AfterViewInit, booleanAttribute, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PartyID } from '@vality/domain-proto/domain';
import {
    Option,
    NotifyLogService,
    FormControlSuperclass,
    createControlProviders,
} from '@vality/ng-core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap, startWith } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';

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

    options$ = new ReplaySubject<Option<PartyID>[]>(1);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(false);

    constructor(
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngAfterViewInit() {
        this.searchChange$
            .pipe(
                startWith(this.control.value),
                tap(() => {
                    this.options$.next([]);
                    this.progress$.next(true);
                }),
                debounceTime(600),
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
