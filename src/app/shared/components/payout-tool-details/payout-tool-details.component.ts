import { Component, Input } from '@angular/core';

import { PayoutTool } from '@cc/app/api/damsel/gen-model/domain';

@Component({
    selector: 'cc-payout-tool-details',
    templateUrl: './payout-tool-details.component.html',
})
export class PayoutToolDetailsComponent {
    @Input() payoutTool: PayoutTool;
}
