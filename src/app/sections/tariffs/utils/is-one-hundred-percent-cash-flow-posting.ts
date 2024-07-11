import { CashFlowPosting } from '@vality/domain-proto/domain';

export function isOneHundredPercentCashFlowPosting(v: CashFlowPosting) {
    return !(v?.volume?.share?.parts?.p === 1 && v?.volume?.share?.parts?.q === 1);
}
