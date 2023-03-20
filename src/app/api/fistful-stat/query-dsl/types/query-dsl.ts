import { Chargebacks } from './chargebacks';
import { Deposit } from './deposit';
import { DepositRevertParams } from './deposit-revert';
import { ModelParams } from './model-params';
import { Params } from './params';
import { Payment } from './payment';
import { Refund } from './refund';
import { SourceParams } from './source';
import { WalletParams } from './wallet';
import { WithdrawalParams } from './withdrawal-params';

export type ChargebacksParams = Params & ModelParams & Chargebacks;
export type RefundsParams = Refund & ModelParams;

/**
 * Available parameters:
 * https://github.com/valitydev/fistful-magista/blob/master/src/main/java/dev/vality/fistful/magista/query/impl/Parameters.java
 * For example, withdrawal parameters:
 * https://github.com/valitydev/fistful-magista/blob/e29771c64115569caef2faac141dfa9b6963c555/src/main/java/dev/vality/fistful/magista/query/impl/WithdrawalFunction.java#L115
 */
export interface QueryDsl {
    query: {
        payments?: Payment & Params & ModelParams;
        deposits?: Deposit & Params & ModelParams;
        chargebacks?: ChargebacksParams;
        refunds?: RefundsParams;
        wallets?: WalletParams;
        deposit_reverts?: DepositRevertParams;
        withdrawals?: WithdrawalParams;
        sources?: SourceParams;
    };
}
