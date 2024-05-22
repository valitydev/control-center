import { Component, computed, input } from '@angular/core';
import { Rational } from '@vality/domain-proto/internal/base';
import {
    CashFlowDecision,
    CashFlowPosting,
    CashFlowSelector,
    CashVolume,
} from '@vality/domain-proto/internal/domain';
import { TimedTermSet } from '@vality/dominator-proto/internal/proto/domain';
import { Column, formatCurrency, TableModule } from '@vality/ng-core';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import round from 'lodash-es/round';

import { formatPredicate } from '@cc/app/shared/utils/table/format-predicate';

function formatRational(value: Rational) {
    return `${round((value.p / value.q) * 100, 4)}%`;
}

function formatCashVolume(d: CashVolume) {
    switch (getUnionKey(d)) {
        case 'fixed':
            return formatCurrency(d?.fixed?.cash?.amount, d?.fixed?.cash?.currency?.symbolic_code);
        case 'share':
            return formatRational(d?.share?.parts);
        case 'product':
            return `${getUnionKey(d.product).slice(0, -3)}(${Array.from(getUnionValue(d.product))
                .map((c) => formatCashVolume(c))
                .join(', ')})`;
    }
}

function formatCashFlowPosting(p: CashFlowPosting) {
    return `${getUnionKey(p?.source)} ${getUnionValue(p?.source)} -> ${getUnionKey(
        p?.destination,
    )} ${getUnionValue(p?.destination)}: ${formatCashVolume(p.volume)}`;
}

function formatCashFlowDecisions(d: CashFlowDecision[]) {
    if (!d?.length) {
        return '';
    }
    return (
        '' +
        d
            .map(
                (d) =>
                    `if ${formatPredicate(d?.if_)} then ${d?.then_?.value
                        ?.map((p) => formatCashFlowPosting(p))
                        ?.join(', ')} ${formatCashFlowDecisions(d?.then_?.decisions)}`,
            )
            ?.join?.('; ')
    );
}

@Component({
    selector: 'cc-termsets-table',
    standalone: true,
    imports: [TableModule],
    templateUrl: './termsets-table.component.html',
    styles: ``,
})
export class TermsetsTableComponent {
    data = input<TimedTermSet[]>();
    cashFlowsData = computed(
        () =>
            this.data()
                ?.map?.((t) => t?.terms?.payments?.fees)
                ?.filter(Boolean),
    );
    columns: Column<CashFlowSelector>[] = [
        {
            field: 'decisions',
            formatter: (d) => formatCashFlowDecisions(d?.decisions),
        },
        {
            field: 'value',
            formatter: (d) =>
                d?.value
                    ?.filter(
                        (c) =>
                            getUnionKey(c?.source) === 'merchant' &&
                            getUnionKey(c?.destination) === 'system',
                    )
                    ?.sort()
                    ?.map((c) => formatCashVolume(c.volume))
                    .join(' + '),
        },
    ];
}
