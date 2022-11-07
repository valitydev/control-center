import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';

import { SearchFiltersParams } from '../search-filters-params';
import { PaymentsMainSearchFiltersService } from './payments-main-search-filters.service';

@UntilDestroy()
@Component({
    selector: 'cc-payments-main-search-filters',
    templateUrl: 'payments-main-search-filters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentsMainSearchFiltersService],
})
export class PaymentsMainSearchFiltersComponent implements OnInit {
    @Input() initParams: SearchFiltersParams;
    @Output() valueChanges = new EventEmitter<SearchFiltersParams>();

    shops$ = this.paymentsMainSearchFiltersService.shops$;
    form = this.paymentsMainSearchFiltersService.form;

    constructor(private paymentsMainSearchFiltersService: PaymentsMainSearchFiltersService) {}

    ngOnInit() {
        this.paymentsMainSearchFiltersService.searchParamsChanges$
            .pipe(untilDestroyed(this))
            .subscribe((params) => this.valueChanges.emit(params));
        this.paymentsMainSearchFiltersService.init(this.initParams);
        this.form.controls.partyID.valueChanges
            .pipe(filter(Boolean), untilDestroyed(this))
            .subscribe((partyID: string) => {
                this.paymentsMainSearchFiltersService.getShops(partyID);
            });
    }
}
