import { Predicate } from '@vality/domain-proto/internal/domain';

export function isThatCurrency(predicate: Predicate, currency: string) {
    return predicate?.condition?.currency_is?.symbolic_code === currency;
}
