import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogService, DialogResponseStatus } from '@vality/ng-core';
import { ReplaySubject } from 'rxjs';
import { filter, map, shareReplay, switchMap, first } from 'rxjs/operators';

import { removeEmptyProperties } from '@cc/utils/remove-empty-properties';

import { SearchFiltersParams } from '../search-filters-params';
import { formParamsToSearchParams } from './form-params-to-search-params';
import { OtherFiltersDialogComponent } from './other-filters-dialog';
import { searchParamsToFormParams } from './search-params-to-form-params';
import { toFiltersCount } from './to-filters-count';

@UntilDestroy()
@Injectable()
export class PaymentsOtherSearchFiltersService {
    private formParams = new ReplaySubject<SearchFiltersParams>(1);

    private countableKeys = [
        'payerEmail',
        'terminalID',
        'providerID',
        'paymentStatus',
        'domainRevisionFrom',
        'domainRevisionTo',
        'paymentAmountFrom',
        'paymentAmountTo',
        'paymentMethod',
        'tokenProvider',
        'paymentSystem',
    ];

    // eslint-disable-next-line @typescript-eslint/member-ordering
    searchParamsChanges$ = this.formParams.pipe(map(formParamsToSearchParams), shareReplay(1));

    // eslint-disable-next-line @typescript-eslint/member-ordering
    filtersCount$ = this.searchParamsChanges$.pipe(
        map(removeEmptyProperties),
        map(toFiltersCount(this.countableKeys)),
        shareReplay(1)
    );

    constructor(private dialogService: DialogService) {}

    init(params: SearchFiltersParams) {
        this.formParams.next(searchParamsToFormParams(params));
    }

    openOtherFiltersDialog() {
        this.formParams
            .pipe(
                first(),
                switchMap((data) =>
                    this.dialogService.open(OtherFiltersDialogComponent, data).afterClosed()
                ),
                filter(({ status }) => status === DialogResponseStatus.Success),
                untilDestroyed(this)
            )
            .subscribe(({ data }) => this.formParams.next(data));
    }
}
