import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PartyID } from '@vality/domain-proto';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, debounceTime, filter, first, map, switchMap } from 'rxjs/operators';

import { Option } from '@cc/components/select-search-field';
import { progressTo } from '@cc/utils/operators';

import { createControlProviders, ValidatedFormControlSuperclass } from '../../../../utils';
import { DeanonimusService } from '../../../thrift-services/deanonimus';

@UntilDestroy()
@Component({
    selector: 'cc-merchant-field',
    templateUrl: 'merchant-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: createControlProviders(MerchantFieldComponent),
})
export class MerchantFieldComponent
    extends ValidatedFormControlSuperclass<PartyID>
    implements OnInit
{
    @Input() label: string;
    @Input() @coerceBoolean required: boolean;

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

    ngOnInit() {
        this.control.valueChanges.pipe(first()).subscribe((v) => this.searchChange$.next(v));
        this.searchChange$
            .pipe(
                filter(Boolean),
                debounceTime(600),
                switchMap((str) => this.searchOptions(str)),
                untilDestroyed(this)
            )
            .subscribe((options) => this.options$.next(options));
        return super.ngOnInit();
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
