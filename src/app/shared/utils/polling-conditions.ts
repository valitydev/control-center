import { StatDeposit } from '@vality/fistful-proto/fistful_stat';

import { getDepositStatus } from './deposit-status';

export const createDepositStopPollingCondition = (deposit: StatDeposit): boolean =>
    !!deposit && getDepositStatus(deposit.status) !== 'pending';
