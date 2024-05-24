import { Component, computed, input } from '@angular/core';
import { TermSetHierarchyObject } from '@vality/domain-proto/internal/domain';

import { CardComponent } from '@cc/app/shared/components/sidenav-info/components/card/card.component';

import { CashFlowsSelectorTableComponent } from '../cash-flows-selector-table/cash-flows-selector-table.component';

@Component({
    selector: 'cc-termsets-card',
    standalone: true,
    imports: [CardComponent, CashFlowsSelectorTableComponent],
    templateUrl: './termsets-card.component.html',
    styles: ``,
})
export class TermsetsCardComponent {
    data = input<TermSetHierarchyObject>();
    feesData = computed(
        () =>
            this.data()
                ?.data?.term_sets?.map?.((t) => t?.terms?.payments?.fees)
                ?.filter?.(Boolean),
    );
}
