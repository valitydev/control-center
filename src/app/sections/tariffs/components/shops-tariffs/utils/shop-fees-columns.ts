import {
    CashFlowPosting,
    Predicate,
    PartyID,
    ShopID,
    TermSetHierarchyObject,
} from '@vality/domain-proto/internal/domain';
import { Column2 } from '@vality/ng-core';

import { getCashVolumeParts, formatCashVolumes } from '../../../../../shared';
import { InlineDecision2, formatLevelPredicate } from '../../../utils/get-inline-decisions';
import { isOneHundredPercentCashFlowPosting } from '../../../utils/is-one-hundred-percent-cash-flow-posting';
import { isThatCurrency } from '../../../utils/is-that-currency';

export function getShopCashFlowSelectors(d: TermSetHierarchyObject) {
    return d?.data?.term_sets?.map?.((t) => t?.terms?.payments?.fees)?.filter?.(Boolean) ?? [];
}

export function isShopFee(v: CashFlowPosting) {
    return v?.source?.merchant === 0 && v?.destination?.system === 0;
}

export function isShopRreserve(v: CashFlowPosting) {
    return v?.source?.merchant === 0 && v?.destination?.merchant === 1;
}

export function isThatShopParty(predicate: Predicate, partyId: PartyID, shopId: ShopID) {
    return (
        predicate?.condition?.party?.id === partyId &&
        predicate?.condition?.party?.definition?.shop_is === shopId
    );
}

export function isShopTermSetDecision(
    v: InlineDecision2,
    params: { partyId: PartyID; shopId: ShopID; currency: string },
) {
    return (
        (!v?.if?.condition?.party?.definition?.shop_is ||
            isThatShopParty(v?.if, params.partyId, params.shopId)) &&
        (!v?.if?.condition?.currency_is?.symbolic_code || isThatCurrency(v?.if, params.currency))
    );
}

export const SHOP_FEES_COLUMNS = [
    {
        field: 'condition',
        child: (d) => ({ value: formatLevelPredicate(d) }),
    },
    {
        field: 'feeShare',
        header: 'Fee, %',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isShopFee).map((v) => v.volume))?.share,
        }),
    },
    {
        field: 'feeFixed',
        header: 'Fee, fix',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isShopFee).map((v) => v.volume))?.fixed,
        }),
    },
    {
        field: 'feeMin',
        header: 'Fee, min',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isShopFee).map((v) => v.volume))?.max,
        }),
    },
    {
        field: 'feeMax',
        header: 'Fee, max',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isShopFee).map((v) => v.volume))?.min,
        }),
    },
    {
        field: 'rreserve',
        header: 'RReserve',
        child: (d) => ({
            value: formatCashVolumes(d.value.filter(isShopRreserve).map((v) => v.volume)),
        }),
    },
    {
        field: 'other',
        child: (d) => ({
            value: formatCashVolumes(
                d.value
                    .filter(
                        (v) =>
                            !isShopFee(v) &&
                            !isShopRreserve(v) &&
                            !isOneHundredPercentCashFlowPosting(v),
                    )
                    .map((v) => v.volume),
            ),
        }),
    },
] satisfies Column2<object, InlineDecision2>[];
