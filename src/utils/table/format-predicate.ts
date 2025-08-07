import { Predicate } from '@vality/domain-proto/domain';
import { formatCurrency, inlineJson } from '@vality/matez';
import { getUnionKey, getUnionValue, toJson } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

const TRUE_PREDICATE_VALUE = formatPredicate({ constant: true });
const FALSE_PREDICATE_VALUE = formatPredicate({ constant: false });

export function getPredicateBoolean(predicate: Predicate): boolean {
    let constant: boolean;
    switch (getUnionKey(predicate)) {
        case 'all_of':
            constant = Array.from(predicate.all_of).find(
                (p) => getUnionKey(p) === 'constant',
            )?.constant;
            break;
        case 'constant':
            constant = predicate.constant;
            break;
    }
    return constant ?? true;
}

export function isPrimitiveBooleanPredicate(predicateOrStrPredicate: Predicate | string): boolean {
    const formattedPredicate =
        typeof predicateOrStrPredicate === 'string'
            ? predicateOrStrPredicate
            : formatPredicate(predicateOrStrPredicate);
    return (
        formattedPredicate === FALSE_PREDICATE_VALUE || formattedPredicate === TRUE_PREDICATE_VALUE
    );
}

export function formatPredicate(predicate: Predicate, level = 0, not = false): string {
    if (!predicate) {
        return '';
    }
    const type = getUnionKey(predicate);
    const equalSymbol = not ? '≠' : '=';
    switch (type) {
        case 'constant':
            return startCase(String(not ? !predicate.constant : predicate.constant));
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
                .join(type === 'all_of' ? ' & ' : ' ∨ ');
            return `${not ? 'NOT ' : ''}${level === 0 ? `(${res})` : res}`;
        }
        case 'condition': {
            const condition = predicate.condition;
            const conditionType = getUnionKey(condition);
            switch (conditionType) {
                case 'currency_is':
                    return `currency ${equalSymbol} ${condition.currency_is.symbolic_code}`;
                case 'category_is':
                    return `category ${equalSymbol} #${condition.category_is.id}`;
                case 'cost_in':
                    return `cost ${equalSymbol} ${
                        getUnionKey(condition.cost_in.lower) === 'inclusive' ? '[' : '('
                    }${formatCurrency(
                        getUnionValue(condition.cost_in.lower)?.amount,
                        getUnionValue(condition.cost_in.lower)?.currency?.symbolic_code,
                    )}, ${formatCurrency(
                        getUnionValue(condition.cost_in.upper)?.amount,
                        getUnionValue(condition.cost_in.upper)?.currency?.symbolic_code,
                    )}${getUnionKey(condition.cost_in.upper) === 'inclusive' ? ']' : ')'}`;
                case 'cost_is_multiple_of':
                    return `cost_is_multiple ${equalSymbol} ${formatCurrency(
                        condition.cost_is_multiple_of.amount,
                        condition.cost_is_multiple_of.currency.symbolic_code,
                    )}`;
                case 'party':
                    return `party ${equalSymbol} (#${condition.party.id}${
                        condition.party?.definition
                            ? ' & ' + inlineJson(toJson(condition.party?.definition), Infinity)
                            : ''
                    })`;
                case 'shop_location_is':
                    return `shop_url ${equalSymbol} ${condition.shop_location_is.url}`;
                case 'bin_data':
                case 'payment_tool':
                default:
                    return `${conditionType} ${equalSymbol} ${inlineJson(
                        toJson(condition[conditionType]),
                        Infinity,
                    )}`;
            }
        }
        case 'criterion':
            return `${startCase(getUnionKey(predicate))}${not ? ` ${equalSymbol}` : ''} #${
                predicate.criterion.id
            }`;
        case 'is_not': {
            if (getUnionKey(getUnionValue(predicate) as Predicate) !== 'is_not') {
                return formatPredicate(predicate.is_not, level, !not);
            }
            return '';
        }
    }
}
