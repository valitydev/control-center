import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { coerceBoolean } from 'coerce-property';
import { debounceTime, map, take } from 'rxjs/operators';

import { CLAIM_STATUSES } from '@cc/app/api/claim-management';
import { removeEmptyProperties } from '@cc/utils/remove-empty-properties';

import { ClaimSearchForm } from './claim-search-form';
import { queryParamsToFormValue } from './query-params-to-form-value';

@UntilDestroy()
@Component({
    selector: 'cc-claim-search-form',
    templateUrl: 'claim-search-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimSearchFormComponent implements OnInit {
    @Input() @coerceBoolean hideMerchantSearch = false;
    @Output() valueChanges = new EventEmitter<ClaimSearchForm>();

    form = this.fb.group<ClaimSearchForm>({
        statuses: null,
        claim_id: null,
        party_id: null,
    });

    claimStatuses = CLAIM_STATUSES;

    constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.form.valueChanges
            .pipe(debounceTime(600), map(removeEmptyProperties), untilDestroyed(this))
            .subscribe((value) => {
                void this.router.navigate([location.pathname], { queryParams: value });
                this.valueChanges.emit(value as never);
            });
        this.route.queryParams
            .pipe(
                take(1),
                map(queryParamsToFormValue),
                map(removeEmptyProperties),
                untilDestroyed(this)
            )
            .subscribe((v) => this.form.patchValue(v));
    }
}
