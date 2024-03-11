import {
    TerminalObject,
    RoutingRulesObject,
    RoutingDelegate,
    RoutingCandidate,
} from '@vality/domain-proto/domain';

import { getUnionKey } from '../../../../utils';

export interface TerminalShopWalletDelegate {
    delegate: RoutingDelegate;
    rule: RoutingRulesObject;
    terminalRule: RoutingRulesObject;
    candidates: RoutingCandidate[];
}

export function getTerminalShopWalletDelegates(
    rules: RoutingRulesObject[],
    terminalObj: TerminalObject,
): TerminalShopWalletDelegate[] {
    const terminalRules = rules.filter(
        (r) => r.data?.decisions?.candidates?.some?.((c) => c.terminal.id === terminalObj.ref.id),
    );
    return terminalRules
        .map((terminalRule) =>
            rules.map((rule) =>
                (
                    rule?.data?.decisions?.delegates?.filter?.(
                        (d) =>
                            d?.ruleset?.id === terminalRule.ref.id &&
                            d?.allowed?.condition?.party &&
                            ['wallet_is', 'shop_is'].includes(
                                getUnionKey(d?.allowed?.condition?.party?.definition),
                            ),
                    ) || []
                ).map((delegate) => ({
                    delegate,
                    rule,
                    terminalRule,
                    candidates: terminalRule.data?.decisions?.candidates?.filter?.(
                        (c) => c.terminal.id === terminalObj.ref.id,
                    ),
                })),
            ),
        )
        .flat(2);
}
