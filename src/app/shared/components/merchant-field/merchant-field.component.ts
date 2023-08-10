import { Component, Input, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PartyID } from '@vality/domain-proto/domain';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject, merge } from 'rxjs';
import {
    catchError,
    debounceTime,
    filter,
    map,
    switchMap,
    first,
    takeUntil,
    startWith,
} from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';
import { Option } from '@cc/components/select-search-field';
import { createControlProviders, ValidatedFormControlSuperclass } from '@cc/utils';
import { progressTo } from '@cc/utils/operators';

@UntilDestroy()
@Component({
    selector: 'cc-merchant-field',
    templateUrl: 'merchant-field.component.html',
    providers: createControlProviders(() => MerchantFieldComponent),
})
export class MerchantFieldComponent
    extends ValidatedFormControlSuperclass<PartyID>
    implements AfterViewInit
{
    @Input() label: string;
    @Input() @coerceBoolean required: boolean;

    options$ = new ReplaySubject<Option<PartyID>[]>(1);
    searchChange$ = new Subject<string>();
    progress$ = new BehaviorSubject(0);

    constructor(
        private deanonimusService: DeanonimusService,
        private snackBar: MatSnackBar,
    ) {
        super();
    }

    ngAfterViewInit() {
        merge(
            this.searchChange$,
            this.control.valueChanges.pipe(
                startWith(this.control.value),
                filter(Boolean),
                first(),
                takeUntil(this.searchChange$),
            ),
        )
            .pipe(
                filter(Boolean),
                debounceTime(600),
                switchMap((str) => this.searchOptions(str)),
                untilDestroyed(this),
            )
            .subscribe((options) => this.options$.next(options));
    }

    private searchOptions(str: string): Observable<Option<PartyID>[]> {
        return this.deanonimusService.searchParty(str).pipe(
            map((parties) => parties.map((p) => ({ label: p.party.email, value: p.party.id }))),
            progressTo(this.progress$),
            catchError((err) => {
                this.snackBar.open('Search error', 'OK', { duration: 2000 });
                console.error(err);
                return of([]);
            }),
        );
    }
}
