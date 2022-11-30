import { Injectable } from '@angular/core';
import { StatDeposit } from '@vality/fistful-proto/lib/fistful_stat';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { FetchResult, PartialFetcher } from '@cc/app/shared/services';
import { booleanDelay } from '@cc/utils/boolean-delay';

import { FistfulStatisticsService } from '../../../../thrift-services/deprecated-fistful/fistful-stat.service';
import { SearchParams } from '../../types/search-params';

@Injectable()
export class FetchDepositsService extends PartialFetcher<StatDeposit, SearchParams> {
    isLoading$ = this.doAction$.pipe(booleanDelay(), shareReplay(1));

    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    fetch(params: SearchParams, continuationToken: string): Observable<FetchResult<StatDeposit>> {
        return this.fistfulStatisticsService.getDeposits(params, continuationToken);
    }
}
