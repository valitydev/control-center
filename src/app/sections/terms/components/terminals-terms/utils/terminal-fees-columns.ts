import { CashFlowPosting, ProvisionTermSet } from '@vality/domain-proto/domain';
import { Column, TreeDataItem } from '@vality/matez';

import { createFeesColumns } from '../../../utils/create-fees-columns';
import { FlatDecision, getFlatDecisions } from '../../../utils/get-flat-decisions';

export interface TerminalChild {
    payment: FlatDecision;
    withdrawal: FlatDecision;
}

export function getTerminalPaymentsCashFlowSelectors(d: ProvisionTermSet) {
    return [d?.payments?.cash_flow].filter(Boolean);
}

export function getTerminalWalletsCashFlowSelectors(d: ProvisionTermSet) {
    return [d?.wallet?.withdrawals?.cash_flow].filter(Boolean);
}

export function isPaymentFee(v: CashFlowPosting) {
    return v?.source?.system === 0 && v?.destination?.provider === 0;
}

export function isWithdrawalFee(v: CashFlowPosting) {
    return v?.source?.system === 0 && v?.destination?.provider === 0;
}

export function getTerminalTreeDataItem<T extends object>(
    selectTermSet: (d: T) => ProvisionTermSet,
) {
    return (d: T): TreeDataItem<T, TerminalChild> => {
        const termSet = selectTermSet(d);
        const paymentsDecisions = getFlatDecisions(getTerminalPaymentsCashFlowSelectors(termSet));
        const withdrawalsDecisions = getFlatDecisions(getTerminalWalletsCashFlowSelectors(termSet));
        return {
            value: d,
            children: new Array(Math.max(paymentsDecisions.length, withdrawalsDecisions.length))
                .fill(null)
                .map((_, idx) => ({
                    payment: paymentsDecisions[idx],
                    withdrawal: withdrawalsDecisions[idx],
                })),
        };
    };
}

export const TERMINAL_FEES_COLUMNS = [
    ...createFeesColumns<TerminalChild>({
        conditionLabel: 'Payment Condition',
        feeFilter: isPaymentFee,
        selectFlatDecision: (d) => d.payment,
    }),
    ...createFeesColumns<TerminalChild>({
        conditionLabel: 'Withdrawal Condition',
        feeFilter: isWithdrawalFee,
        selectFlatDecision: (d) => d.withdrawal,
    }),
] satisfies Column<object, TerminalChild>[];
