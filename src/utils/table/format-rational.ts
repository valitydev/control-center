import round from 'lodash-es/round';

import { type base } from '@vality/domain-proto/domain';

export function formatRational(value: base.Rational) {
    return `${round((value.p / value.q) * 100, 4)}%`;
}
