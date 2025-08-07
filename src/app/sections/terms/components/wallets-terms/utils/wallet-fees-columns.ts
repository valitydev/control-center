import type { domain } from '@vality/dominator-proto/dominator';

import { createFeesColumns } from '../../../utils/create-fees-columns';
import { FlatDecision } from '../../../utils/get-flat-decisions';
import { isThatCurrency } from '../../../utils/is-that-currency';

export function getWalletCashFlowSelectors(d: domain.TermSetHierarchyObject) {
    return (
        d.data.term_sets
            ?.map?.((t) => t?.terms?.wallets?.withdrawals?.cash_flow)
            ?.filter?.(Boolean) ?? []
    );
}

export function isWalletFee(v: domain.CashFlowPosting) {
    return v?.source?.wallet === 1 && v?.destination?.system === 0;
}

export function isThatWalletParty(
    predicate: domain.Predicate,
    partyId: domain.PartyID,
    walletId: domain.WalletID,
) {
    return (
        predicate?.condition?.party?.id === partyId &&
        predicate?.condition?.party?.definition?.wallet_is === walletId
    );
}

export function isWalletTermSetDecision(
    v: FlatDecision,
    params: { partyId: domain.PartyID; walletId: domain.WalletID; currency: string },
) {
    return (
        (!v?.if?.condition?.party?.definition?.wallet_is ||
            isThatWalletParty(v?.if, params.partyId, params.walletId)) &&
        (!v?.if?.condition?.currency_is?.symbolic_code || isThatCurrency(v?.if, params.currency))
    );
}

export const WALLET_FEES_COLUMNS = createFeesColumns({
    feeFilter: isWalletFee,
});
