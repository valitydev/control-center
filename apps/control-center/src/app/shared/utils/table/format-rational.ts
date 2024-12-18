import { Rational } from '@vality/domain-proto/internal/base';
import round from 'lodash-es/round';

export function formatRational(value: Rational) {
    return `${round((value.p / value.q) * 100, 4)}%`;
}
