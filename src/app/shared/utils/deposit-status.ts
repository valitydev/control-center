import { DepositStatus } from '@vality/fistful-proto/fistful_stat';

import { clearNullFields } from '@cc/utils/thrift-utils';

export const getDepositStatus = (status: DepositStatus): string =>
    Object.keys(clearNullFields(status))[0];
