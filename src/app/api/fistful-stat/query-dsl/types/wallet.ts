// https://github.com/valitydev/fistful-magista/blob/e29771c64115569caef2faac141dfa9b6963c555/src/main/java/dev/vality/fistful/magista/query/impl/WalletFunction.java#L96
import { PagedBaseParameters } from './paged-base-parameters';

export interface WalletParams extends PagedBaseParameters {
    party_id?: string;
    identity_id?: string;
    currency_code?: string;
}
