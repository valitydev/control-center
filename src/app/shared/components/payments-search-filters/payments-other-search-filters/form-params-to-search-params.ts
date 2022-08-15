import { toMinor } from '@cc/utils/to-minor';

import { SearchFiltersParams } from '../search-filters-params';

export const formParamsToSearchParams = (params: SearchFiltersParams): SearchFiltersParams => ({
    ...params,
    ...(params.paymentAmountFrom ? { paymentAmountFrom: toMinor(params.paymentAmountFrom) } : {}),
    ...(params.paymentAmountTo ? { paymentAmountTo: toMinor(params.paymentAmountTo) } : {}),
});
