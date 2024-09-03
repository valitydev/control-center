import { ProvisionTermSet, CashFlowPosting } from '@vality/domain-proto/internal/domain';
import { Column2, TreeDataItem } from '@vality/ng-core';

import { createFeesColumns } from '../../../utils/create-fees-columns';
import { InlineDecision2, getInlineDecisions2 } from '../../../utils/get-inline-decisions';

export interface TerminalChild {
    payment: InlineDecision2;
    withdrawal: InlineDecision2;
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
        const paymentsDecisions = getInlineDecisions2(
            getTerminalPaymentsCashFlowSelectors(termSet),
        );
        const withdrawalsDecisions = getInlineDecisions2(
            getTerminalWalletsCashFlowSelectors(termSet),
        );
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
        selectInlineDecision: (d) => d.payment,
    }),
    ...createFeesColumns<TerminalChild>({
        conditionLabel: 'Withdrawal Condition',
        feeFilter: isWithdrawalFee,
        selectInlineDecision: (d) => d.withdrawal,
    }),
] satisfies Column2<object, TerminalChild>[];
