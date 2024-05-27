import { Component, computed, input } from '@angular/core';
import { TermSetHierarchyObject } from '@vality/domain-proto/internal/domain';

import { CardComponent } from '../sidenav-info/components/card/card.component';

@Component({
    selector: 'cc-termsets-card',
    standalone: true,
    imports: [CardComponent],
    templateUrl: './termsets-history-card.component.html',
    styles: ``,
})
export class TermsetsHistoryCardComponent {
    data = input<TermSetHierarchyObject[]>();
    feesData = computed(
        () =>
            this.data()?.map?.(
                (d) =>
                    d?.data?.term_sets?.map?.((t) => t?.terms?.payments?.fees)?.filter?.(Boolean),
            ),
    );
}
