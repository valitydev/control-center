import { type base } from '@vality/domain-proto/domain';
import round from 'lodash-es/round';

export function formatRational(value: base.Rational) {
    return `${round((value.p / value.q) * 100, 4)}%`;
}
