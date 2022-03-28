import { DepositID } from '@vality/fistful-proto/lib/deposit';

import { DepositActions } from './deposit-actions';

export interface DepositMenuItemEvent {
    action: DepositActions;
    depositID: DepositID;
}
