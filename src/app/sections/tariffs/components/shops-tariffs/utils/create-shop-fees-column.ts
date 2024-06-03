import type { TermSetHierarchyObject } from '@vality/dominator-proto/internal/proto/domain';

import { createFeesColumns } from '../../../utils/create-fees-columns';

export function getViewedCashFlowSelectors(d: TermSetHierarchyObject) {
    return d?.data?.term_sets?.map?.((t) => t?.terms?.payments?.fees)?.filter?.(Boolean) ?? [];
}

export function createShopFeesColumn<T extends object = TermSetHierarchyObject>(
    fn: (d: T) => TermSetHierarchyObject = (d) => d as never,
) {
    return createFeesColumns<T>(
        (d) => getViewedCashFlowSelectors(fn(d)),
        (v) => v?.source?.merchant === 0 && v?.destination?.system === 0,
        (v) => v?.source?.merchant === 0 && v?.destination?.merchant === 1,
    );
}
