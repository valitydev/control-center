import { CashFlowPosting } from '@vality/domain-proto/internal/domain';
import { Column } from '@vality/matez';

import { getCashVolumeParts, formatCashVolumes } from '../../../shared';

import {
    formatLevelPredicate,
    formatCashFlowSourceDestination,
    FlatDecision,
} from './get-flat-decisions';
import { isOneHundredPercentCashFlowPosting } from './is-one-hundred-percent-cash-flow-posting';

export function createFeesColumns<T extends object>({
    selectFlatDecision = (d) => d as never,
    conditionLabel = 'Condition',
    feeFilter = () => true,
    otherFilter = () => true,
}: {
    selectFlatDecision?: (d: T) => FlatDecision;
    conditionLabel?: string;
    feeFilter?: (v: CashFlowPosting) => boolean;
    otherFilter?: (v: CashFlowPosting) => boolean;
} = {}): Column<object, T>[] {
    function getFeeCashVolumeParts(d: T) {
        const decision = selectFlatDecision(d);
        return decision
            ? getCashVolumeParts(decision.value.filter(feeFilter).map((v) => v.volume))
            : null;
    }
    return [
        {
            field: conditionLabel,
            header: conditionLabel,
            child: (d) => ({
                value: selectFlatDecision(d) ? formatLevelPredicate(selectFlatDecision(d)) : null,
            }),
        },
        {
            field: `${conditionLabel}_feeShare`,
            header: 'Fee, %',
            child: (d) => ({
                value: getFeeCashVolumeParts(d)?.share,
            }),
        },
        {
            field: `${conditionLabel}_feeFixed`,
            header: 'Fee, fix',
            child: (d) => ({
                value: getFeeCashVolumeParts(d)?.fixed,
            }),
        },
        {
            field: `${conditionLabel}_feeMin`,
            header: 'Fee, min',
            child: (d) => ({
                value: getFeeCashVolumeParts(d)?.max,
            }),
        },
        {
            field: `${conditionLabel}_feeMax`,
            header: 'Fee, max',
            child: (d) => ({
                value: getFeeCashVolumeParts(d)?.min,
            }),
        },
        {
            field: `${conditionLabel}_other`,
            header: 'Other',
            child: (d) => {
                const decision = selectFlatDecision(d);
                if (!decision) {
                    return null;
                }
                const cashFlow = decision.value.filter(
                    (v) =>
                        otherFilter(v) && !feeFilter(v) && !isOneHundredPercentCashFlowPosting(v),
                );
                return {
                    value: formatCashVolumes(cashFlow.map((v) => v.volume)),
                    tooltip: formatCashFlowSourceDestination(cashFlow),
                };
            },
        },
    ];
}
