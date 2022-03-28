import { StatDeposit } from '@vality/fistful-proto/lib/fistful_stat';

import { getDepositStatus } from './deposit-status';

export const createDepositStopPollingCondition = (deposit: StatDeposit): boolean =>
    !!deposit && getDepositStatus(deposit.status) !== 'pending';
