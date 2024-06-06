import type {
    TermSetHierarchyObject,
    CashFlowPosting,
} from '@vality/dominator-proto/internal/proto/domain';

import { createFeesColumns } from '../../../utils/create-fees-columns';
import { getInlineDecisions } from '../../../utils/get-inline-decisions';

export function getViewedCashFlowSelectors(d: TermSetHierarchyObject) {
    return d?.data?.term_sets?.map?.((t) => t?.terms?.payments?.fees)?.filter?.(Boolean) ?? [];
}

export function createShopFeesColumn<T extends object = TermSetHierarchyObject>(
    fn: (d: T) => TermSetHierarchyObject = (d) => d as never,
) {
    const filterRreserve = (v: CashFlowPosting) =>
        v?.source?.merchant === 0 && v?.destination?.merchant === 1;
    const cols = createFeesColumns<T>(
        (d) => getViewedCashFlowSelectors(fn(d)),
        (v) => v?.source?.merchant === 0 && v?.destination?.system === 0,
        (v) => !filterRreserve(v),
    );
    return [
        ...cols.slice(0, -1),
        {
            field: 'rreserve',
            header: 'RReserve',
            formatter: (d) =>
                getInlineDecisions(getViewedCashFlowSelectors(fn(d)), filterRreserve).map(
                    (v) => v.value,
                ),
        },
        cols.at(-1),
    ];
}
