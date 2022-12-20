import { Component, Input } from '@angular/core';
import { PayoutTool } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-payout-tool-details',
    templateUrl: './payout-tool-details.component.html',
})
export class PayoutToolDetailsComponent {
    @Input() payoutTool: PayoutTool;
}
