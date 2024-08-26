import {
    CashFlowPosting,
    PartyID,
    Predicate,
    WalletID,
} from '@vality/domain-proto/internal/domain';
import { Column2 } from '@vality/ng-core';

import type { TermSetHierarchyObject } from '@vality/dominator-proto/internal/proto/domain';

import { getCashVolumeParts, formatCashVolumes } from '../../../../../shared';
import { InlineDecision2, formatLevelPredicate } from '../../../utils/get-inline-decisions';
import { isOneHundredPercentCashFlowPosting } from '../../../utils/is-one-hundred-percent-cash-flow-posting';
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
    v: InlineDecision2,
    params: { partyId: PartyID; walletId: WalletID; currency: string },
) {
    return (
        (!v?.if?.condition?.party?.definition?.wallet_is ||
            isThatWalletParty(v?.if, params.partyId, params.walletId)) &&
        (!v?.if?.condition?.currency_is?.symbolic_code || isThatCurrency(v?.if, params.currency))
    );
}

export const WALLET_FEES_COLUMNS = [
    {
        field: 'condition',
        child: (d) => ({ value: formatLevelPredicate(d) }),
    },
    {
        field: 'feeShare',
        header: 'Fee, %',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isWalletFee).map((v) => v.volume))?.share,
        }),
    },
    {
        field: 'feeFixed',
        header: 'Fee, fix',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isWalletFee).map((v) => v.volume))?.fixed,
        }),
    },
    {
        field: 'feeMin',
        header: 'Fee, min',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isWalletFee).map((v) => v.volume))?.max,
        }),
    },
    {
        field: 'feeMax',
        header: 'Fee, max',
        child: (d) => ({
            value: getCashVolumeParts(d.value.filter(isWalletFee).map((v) => v.volume))?.min,
        }),
    },
    {
        field: 'other',
        child: (d) => ({
            value: formatCashVolumes(
                d.value
                    .filter((v) => !isWalletFee(v) && !isOneHundredPercentCashFlowPosting(v))
                    .map((v) => v.volume),
            ),
        }),
    },
] satisfies Column2<object, InlineDecision2>[];
