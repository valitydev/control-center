import pick from 'lodash-es/pick';
import pickBy from 'lodash-es/pickBy';

import { isNumeric } from '@cc/utils/is-numeric';
import { mapValuesToNumber } from '@cc/utils/map-values-to-number';
import { mapValuesToThriftEnum } from '@cc/utils/map-values-to-thrift-enum';

import { ClaimSearchForm } from './claim-search-form';

export const formValueToSearchParams = (params: any): ClaimSearchForm => ({
    ...params,
    ...mapValuesToThriftEnum(pick(params, 'statuses')),
    ...mapValuesToNumber(pickBy(params, isNumeric)),
});
