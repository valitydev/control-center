import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PaymentTool } from '@vality/magista-proto/lib/domain';

@Component({
    selector: 'cc-payment-tool',
    templateUrl: 'payment-tool.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentToolComponent {
    @Input() paymentTool: PaymentTool;
}
