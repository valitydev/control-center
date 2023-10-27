// https://github.com/valitydev/fistful-magista/blob/e29771c64115569caef2faac141dfa9b6963c555/src/main/java/dev/vality/fistful/magista/query/impl/WithdrawalFunction.java#L115
import { WithdrawalStatus } from '@vality/fistful-proto/fistful_stat';

import { PagedBaseParameters } from './paged-base-parameters';

export interface WithdrawalParams extends PagedBaseParameters {
    party_id?: string;
    wallet_id?: string;
    withdrawal_id?: string;
    withdrawal_ids?: string;
    identity_id?: string;
    destination_id?: string;
    status?: Capitalize<keyof WithdrawalStatus>;
    external_id?: string;
    amount_from?: number;
    amount_to?: number;
    currency_code?: string;
    from_time?: string;
    to_time?: string;
}
