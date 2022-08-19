import { toMajor } from '@cc/utils/to-major';

import { SearchFiltersParams } from '../search-filters-params';

export const searchParamsToFormParams = (params: SearchFiltersParams): SearchFiltersParams => ({
    ...params,
    ...(params.paymentAmountFrom ? { paymentAmountFrom: toMajor(params.paymentAmountFrom) } : {}),
    ...(params.paymentAmountTo ? { paymentAmountTo: toMajor(params.paymentAmountTo) } : {}),
});
