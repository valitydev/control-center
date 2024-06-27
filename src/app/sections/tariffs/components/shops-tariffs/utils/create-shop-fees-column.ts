import { Column2 } from '@vality/ng-core';

import type {
    TermSetHierarchyObject,
    CashFlowPosting,
} from '@vality/dominator-proto/internal/proto/domain';

import { createFeesColumns2 } from '../../../utils/create-fees-columns';
import {
    getInlineDecisions,
    type InlineCashFlowSelector,
} from '../../../utils/get-inline-decisions';

export function getViewedCashFlowSelectors(d: TermSetHierarchyObject) {
    return d?.data?.term_sets?.map?.((t) => t?.terms?.payments?.fees)?.filter?.(Boolean) ?? [];
}

export function createShopFeesColumn<T extends object>(
    fn: (d: T) => TermSetHierarchyObject = (d) => d as never,
    getPartyId: (d: T) => string,
    getShopId: (d: T) => string,
    getCurrency: (d: T) => string,
): Column2<T>[] {
    const filterRreserve = (v: CashFlowPosting) =>
        v?.source?.merchant === 0 && v?.destination?.merchant === 1;
    const filterDecisions = (d: T) => (v: InlineCashFlowSelector) =>
        (!v?.if?.condition?.party?.definition?.shop_is ||
            (v?.if?.condition?.party?.id === getPartyId(d) &&
                v?.if?.condition?.party?.definition?.shop_is === getShopId(d))) &&
        (!getCurrency(d) ||
            !v?.if?.condition?.currency_is?.symbolic_code ||
            v?.if?.condition?.currency_is?.symbolic_code === getCurrency(d));
    const cols = createFeesColumns2<T>(
        (d) => getViewedCashFlowSelectors(fn(d)),
        (v) => v?.source?.merchant === 0 && v?.destination?.system === 0,
        (v) => !filterRreserve(v),
        filterDecisions,
    );
    return [
        ...cols.slice(0, -1),
        {
            field: 'rreserve',
            header: 'RReserve',
            cell: (d) => ({
                value: getInlineDecisions(getViewedCashFlowSelectors(fn(d)), filterRreserve)
                    .filter(filterDecisions(d))
                    .map((v) => v.value),
            }),
        },
        cols.at(-1),
    ];
}
