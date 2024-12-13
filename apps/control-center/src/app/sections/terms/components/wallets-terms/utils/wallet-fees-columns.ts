import {
    CashFlowPosting,
    PartyID,
    Predicate,
    WalletID,
} from '@vality/domain-proto/internal/domain';

import type { TermSetHierarchyObject } from '@vality/dominator-proto/internal/proto/domain';

import { createFeesColumns } from '../../../utils/create-fees-columns';
import { FlatDecision } from '../../../utils/get-flat-decisions';
import { isThatCurrency } from '../../../utils/is-that-currency';

export function getWalletCashFlowSelectors(d: TermSetHierarchyObject) {
    return (
        d.data.term_sets
            ?.map?.((t) => t?.terms?.wallets?.withdrawals?.cash_flow)
            ?.filter?.(Boolean) ?? []
    );
}

export function isWalletFee(v: CashFlowPosting) {
    return v?.source?.wallet === 1 && v?.destination?.system === 0;
}

export function isThatWalletParty(predicate: Predicate, partyId: PartyID, walletId: WalletID) {
    return (
        predicate?.condition?.party?.id === partyId &&
        predicate?.condition?.party?.definition?.wallet_is === walletId
    );
}

export function isWalletTermSetDecision(
    v: FlatDecision,
    params: { partyId: PartyID; walletId: WalletID; currency: string },
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
