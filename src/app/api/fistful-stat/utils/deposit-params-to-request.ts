import { StatRequest } from '@vality/fistful-proto/fistful_stat';

import { QueryDsl } from '../query-dsl';
import { DepositParams } from './deposit-params';

export const depositParamsToRequest = (
    params: DepositParams,
    continuationToken?: string
): StatRequest => {
    const {
        fromTime,
        toTime,
        size,
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
                    size: size,
                    ...(amountTo ? { amount_to: amountTo } : {}),
                    ...(currencyCode ? { currency_code: currencyCode } : {}),
                    ...(depositId ? { deposit_id: depositId } : {}),
                    ...(identityId ? { identity_id: identityId } : {}),
                    ...(partyId ? { party_id: partyId } : {}),
                    ...(sourceId ? { source_id: sourceId } : {}),
                    ...(status ? { status } : {}),
                    ...(walletId ? { wallet_id: walletId } : {}),
                },
            },
        } as QueryDsl),
        ...(continuationToken ? { continuation_token: continuationToken } : {}),
    };
};
