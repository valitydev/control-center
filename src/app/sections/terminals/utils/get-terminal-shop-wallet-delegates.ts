import { TerminalObject, RoutingRulesObject, RoutingDelegate } from '@vality/domain-proto/domain';

import { getUnionKey } from '../../../../utils';

export function getTerminalShopWalletDelegates(
    rules: RoutingRulesObject[],
    terminalObj: TerminalObject,
): {
    delegate: RoutingDelegate;
    rule: RoutingRulesObject;
    terminalRule: RoutingRulesObject;
}[] {
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
                ).map((delegate) => ({ delegate, rule, terminalRule })),
            ),
        )
        .flat(2);
}
