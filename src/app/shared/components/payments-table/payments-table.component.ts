import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InvoiceID, InvoicePaymentID, PartyID } from '@vality/domain-proto/lib/domain';
import { StatPayment } from '@vality/magista-proto';

import { Columns, SELECT_COLUMN_NAME } from '../../../../components/table';
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
    @Input() set selected(selected: StatPayment[]) {
        this.selection.clear();
        if (selected?.length) this.selection.select(...selected);
    }
    @Output() menuItemSelected$ = new EventEmitter<PaymentMenuItemEvent>();
    @Output() selected$ = new EventEmitter<SelectionModel<StatPayment>>();

    paymentActions = Object.keys(PaymentActions);
    cols = new Columns(
        SELECT_COLUMN_NAME,
        'amount',
        'status',
        'createdAt',
        'shop',
        'revision',
        'invoice',
        'party',
        'actions'
    );
    selection = new SelectionModel<StatPayment>();

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
