import { Inject, Injectable, Injector } from '@angular/core';
import { StatDeposit, StatRequest, StatResponse } from '@vality/fistful-proto/lib/fistful_stat';
import { StatRequest as ThriftStatRequest } from '@vality/fistful-proto/lib/fistful_stat/gen-nodejs/fistful_stat_types';
import * as FistfulStatistics from '@vality/fistful-proto/lib/fistful_stat/gen-nodejs/FistfulStatistics';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DepositRevertParams, createDsl, QueryDsl } from '@cc/app/api/fistful-stat';
import { FetchResult } from '@cc/app/shared/services';
import { removeEmptyProperties } from '@cc/utils/remove-empty-properties';

import { SEARCH_LIMIT, SMALL_SEARCH_LIMIT } from '../../tokens';
import { ThriftService } from '../services/thrift/thrift-service';
import { DepositParams } from './deposit-params';

@Injectable()
export class FistfulStatisticsService extends ThriftService {
    constructor(
        injector: Injector,
        @Inject(SEARCH_LIMIT) private searchLimit: number,
        @Inject(SMALL_SEARCH_LIMIT) private smallSearchLimit: number
    ) {
        super(injector, '/wachter', FistfulStatistics, 'FistfulStatistics');
    }

    getDeposits(
        params: DepositParams,
        continuationToken?: string
    ): Observable<FetchResult<StatDeposit>> {
        const request: StatRequest = this.depositParamsToRequest(params, continuationToken);
        return this.toObservableAction('GetDeposits')(new ThriftStatRequest(request)).pipe(
            map((res) => ({
                result: res.data.deposits,
                continuationToken: res.continuation_token,
            }))
        );
    }

    getDepositReverts(
        params: DepositRevertParams,
        continuationToken?: string
    ): Observable<StatResponse> {
        const request: StatRequest = this.depositRevertsParamsToRequest(params, continuationToken);
        return this.toObservableAction('GetDepositReverts')(new ThriftStatRequest(request));
    }

    private depositParamsToRequest(params: DepositParams, continuationToken?: string): StatRequest {
        const {
            fromTime,
            toTime,
            amountTo,
            currencyCode,
            depositId,
            identityId,
            partyId,
            sourceId,
            status,
            walletId,
        } = params;
        return {
            dsl: JSON.stringify({
                query: {
                    deposits: {
                        from_time: fromTime,
                        to_time: toTime,
                        ...(amountTo ? { amount_to: amountTo } : {}),
                        ...(currencyCode ? { currency_code: currencyCode } : {}),
                        ...(depositId ? { deposit_id: depositId } : {}),
                        ...(identityId ? { identity_id: identityId } : {}),
                        ...(partyId ? { party_id: partyId } : {}),
                        ...(sourceId ? { source_id: sourceId } : {}),
                        ...(status ? { status } : {}),
                        ...(walletId ? { wallet_id: walletId } : {}),
                        size: this.searchLimit.toString(),
                    },
                },
            } as QueryDsl),
            ...(continuationToken ? { continuation_token: continuationToken } : {}),
        };
    }

    private depositRevertsParamsToRequest(
        params: DepositRevertParams,
        continuationToken?: string
    ): StatRequest {
        return {
            dsl: createDsl({
                deposit_reverts: {
                    ...removeEmptyProperties(params),
                    size: this.smallSearchLimit.toString(),
                },
            }),
            ...(!!continuationToken && { continuation_token: continuationToken }),
        };
    }
}
