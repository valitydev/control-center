import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BankCard } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-bank-card',
    templateUrl: 'bank-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankCardComponent {
    @Input() bankCard: BankCard;
}
