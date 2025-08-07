import { CashFlowPosting, PartyID, Predicate, ShopID } from '@vality/domain-proto/domain';
import { TermSetHistory } from '@vality/dominator-proto/dominator';
import { Column } from '@vality/matez';

import { formatCashVolumes } from '../../../../../../utils';
import { createFeesColumns } from '../../../utils/create-fees-columns';
import { FlatDecision } from '../../../utils/get-flat-decisions';
import { isThatCurrency } from '../../../utils/is-that-currency';

export function getShopCashFlowSelectors(d: TermSetHistory['term_set']) {
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
    v: FlatDecision,
    params: { partyId: PartyID; shopId: ShopID; currency: string },
) {
    return (
        (!v?.if?.condition?.party?.definition?.shop_is ||
            isThatShopParty(v?.if, params.partyId, params.shopId)) &&
        (!v?.if?.condition?.currency_is?.symbolic_code || isThatCurrency(v?.if, params.currency))
    );
}

const BASE_SHOP_FEES_COLUMNS = createFeesColumns({
    feeFilter: isShopFee,
    otherFilter: (v) => !isShopRreserve(v),
});

export const SHOP_FEES_COLUMNS = [
    ...BASE_SHOP_FEES_COLUMNS.slice(0, -1),
    {
        field: 'rreserve',
        header: 'RReserve',
        child: (d) => ({
            value: formatCashVolumes(d.value.filter(isShopRreserve).map((v) => v.volume)),
        }),
    },
    BASE_SHOP_FEES_COLUMNS.at(-1),
] satisfies Column<object, FlatDecision>[];
