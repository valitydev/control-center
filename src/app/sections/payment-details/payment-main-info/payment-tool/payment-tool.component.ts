import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PaymentTool } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-payment-tool',
    templateUrl: 'payment-tool.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentToolComponent {
    @Input() paymentTool: PaymentTool;
}
