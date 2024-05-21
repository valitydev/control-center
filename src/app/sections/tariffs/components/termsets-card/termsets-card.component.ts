import { Component, Input } from '@angular/core';
import { TermSetHierarchyObject } from '@vality/domain-proto/internal/domain';

import { TermsetsTableComponent } from '@cc/app/sections/tariffs/components/termsets-table/termsets-table.component';
import { CardComponent } from '@cc/app/shared/components/sidenav-info/components/card/card.component';

@Component({
    selector: 'cc-termsets-card',
    standalone: true,
    imports: [CardComponent, TermsetsTableComponent],
    templateUrl: './termsets-card.component.html',
    styles: ``,
})
export class TermsetsCardComponent {
    @Input() data: TermSetHierarchyObject;
}
