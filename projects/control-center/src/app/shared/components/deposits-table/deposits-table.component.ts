import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DepositID } from '@vality/fistful-proto/lib/deposit';
import { StatDeposit } from '@vality/fistful-proto/lib/fistful_stat';

import { DepositActions } from './deposit-actions';
import { DepositMenuItemEvent } from './deposit-menu-item-event';

@Component({
    selector: 'cc-deposits-table',
    templateUrl: 'deposits-table.component.html',
    styleUrls: ['deposits-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositsTableComponent {
    @Input()
    deposits: StatDeposit[];

    @Output()
    menuItemSelected$: EventEmitter<DepositMenuItemEvent> = new EventEmitter();

    depositActions = Object.keys(DepositActions);

    displayedColumns = ['id', 'status', 'createdAt', 'destinationID', 'amount', 'actions'];

    menuItemSelected(action: string, depositID: DepositID) {
        switch (action) {
            case DepositActions.NavigateToDeposit:
                this.menuItemSelected$.emit({ action, depositID });
                break;
            default:
                console.error('Wrong payment action type.');
        }
    }
}
