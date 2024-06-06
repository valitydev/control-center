import type { InlineCashFlowSelector } from '../../../utils/get-inline-decisions';
import type { TermSetHierarchyObject } from '@vality/dominator-proto/internal/proto/domain';

import { createFeesColumns } from '../../../utils/create-fees-columns';

export function getViewedCashFlowSelectors(d: TermSetHierarchyObject) {
    return (
        d.data.term_sets
            ?.map?.((t) => t?.terms?.wallets?.withdrawals?.cash_flow)
            ?.filter?.(Boolean) ?? []
    );
}

export function createWalletFeesColumn<T extends object = TermSetHierarchyObject>(
    fn: (d: T) => TermSetHierarchyObject = (d) => d as never,
    getWalletId: (d: T) => string,
    getCurrency: (d: T) => string,
) {
    return createFeesColumns<T>(
        (d) => getViewedCashFlowSelectors(fn(d)),
        (v) => v?.source?.wallet === 1 && v?.destination?.system === 0,
        undefined,
        (d: T) => (v: InlineCashFlowSelector) =>
            (!v?.if?.condition?.party?.definition?.wallet_is ||
                v?.if?.condition?.party?.definition?.wallet_is === getWalletId(d)) &&
            (!getCurrency(d) ||
                !v?.if?.condition?.currency_is?.symbolic_code ||
                v?.if?.condition?.currency_is?.symbolic_code === getCurrency(d)),
    );
}
