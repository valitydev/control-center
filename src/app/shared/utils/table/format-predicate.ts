import { Predicate } from '@vality/domain-proto/domain';
import { formatCurrency, inlineJson } from '@vality/ng-core';
import { getUnionKey, getUnionValue, toJson } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

export function formatPredicate(predicate: Predicate, level = 0) {
    if (!predicate) {
        return '';
    }
    const type = getUnionKey(predicate);
    switch (type) {
        case 'constant':
            return startCase(String(predicate.constant));
        case 'any_of':
        case 'all_of': {
            const predicatesSet = getUnionValue(predicate) as
                | Predicate['all_of']
                | Predicate['any_of'];
            if (predicatesSet.size <= 1) {
                return formatPredicate(predicatesSet.keys().next().value, level + 1);
            }
            const res = Array.from(predicatesSet)
                .map((p) => formatPredicate(p, level + 1))
                .join(type === 'all_of' ? ' & ' : ' OR ');
            return level === 0 ? `(${res})` : res;
        }
        case 'condition': {
            const condition = predicate.condition;
            switch (getUnionKey(condition)) {
                case 'currency_is':
                    return `currency: ${condition.currency_is.symbolic_code}`;
                case 'bin_data':
                    return `bin_data: ${inlineJson(toJson(condition.bin_data), Infinity)}`;
                case 'category_is':
                    return `category: #${condition.category_is.id}`;
                case 'cost_in':
                    return `cost: ${
                        getUnionKey(condition.cost_in.lower) === 'inclusive' ? '[' : '('
                    }${formatCurrency(
                        getUnionValue(condition.cost_in.lower)?.amount,
                        getUnionValue(condition.cost_in.lower)?.currency?.symbolic_code,
                    )}, ${formatCurrency(
                        getUnionValue(condition.cost_in.upper)?.amount,
                        getUnionValue(condition.cost_in.upper)?.currency?.symbolic_code,
                    )}${getUnionKey(condition.cost_in.upper) === 'inclusive' ? ']' : ')'}`;
                case 'cost_is_multiple_of':
                    return `cost_is_multiple: ${formatCurrency(
                        condition.cost_is_multiple_of.amount,
                        condition.cost_is_multiple_of.currency.symbolic_code,
                    )}`;
                case 'identification_level_is':
                    return `identification_level: ${condition.identification_level_is}`; // TODO: fix enum value
                case 'p2p_tool':
                    return `p2p_tool: ${inlineJson(toJson(condition.p2p_tool), Infinity)}`;
                case 'party':
                    return `party: ${inlineJson(toJson(condition.party), Infinity)}`;
                case 'payment_tool':
                    return `payment_tool: ${inlineJson(toJson(condition.payment_tool), Infinity)}`;
                case 'payout_method_is':
                    return `payout_method: #${condition.payout_method_is.id}`; // TODO: fix enum value
                case 'shop_location_is':
                    return `shop_url: ${condition.shop_location_is.url}`;
            }
            return '';
        }
        case 'criterion':
            return `${startCase(getUnionKey(predicate))} #${predicate.criterion.id}`;
        case 'is_not': {
            if (getUnionKey(getUnionValue(predicate) as Predicate) !== 'is_not') {
                return `NOT ${formatPredicate(predicate.is_not, level + 1)}`;
            }
            return '';
        }
    }
}
