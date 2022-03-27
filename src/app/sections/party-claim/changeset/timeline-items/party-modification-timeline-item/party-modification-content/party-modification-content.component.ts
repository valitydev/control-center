import { Component, Input } from '@angular/core';
import { PartyModification } from '@vality/domain-proto/lib/claim_management';

@Component({
    selector: 'cc-party-modification-content',
    templateUrl: 'party-modification-content.component.html',
})
export class PartyModificationContentComponent {
    @Input()
    expanded = false;

    @Input()
    modification: PartyModification;
}
