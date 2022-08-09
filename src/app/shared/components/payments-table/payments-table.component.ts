import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InvoiceID, InvoicePaymentID, PartyID } from '@vality/domain-proto/lib/domain';
import { StatPayment } from '@vality/magista-proto';

import { PaymentActions } from './payment-actions';
import { PaymentMenuItemEvent } from './payment-menu-item-event';

@Component({
    selector: 'cc-payments-table',
    templateUrl: 'payments-table.component.html',
    styleUrls: ['payments-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsTableComponent {
    @Input() payments: StatPayment[];
    @Output() menuItemSelected$: EventEmitter<PaymentMenuItemEvent> = new EventEmitter();

    paymentActions = Object.keys(PaymentActions);
    displayedColumns = ['amount', 'status', 'createdAt', 'shop', 'actions'];

    menuItemSelected(
        action: string,
        paymentID: InvoicePaymentID,
        invoiceID: InvoiceID,
        partyID: PartyID
    ) {
        switch (action) {
            case PaymentActions.NavigateToPayment:
                this.menuItemSelected$.emit({ action, paymentID, invoiceID, partyID });
                break;
            default:
                console.error('Wrong payment action type.');
        }
    }
}
