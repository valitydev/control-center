import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatDeposit } from '@vality/fistful-proto/lib/fistful_stat';

@Component({
    selector: 'cc-deposit-main-info',
    templateUrl: 'deposit-main-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositMainInfoComponent {
    @Input()
    deposit: StatDeposit;
}
