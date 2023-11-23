import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/domain-proto/payment_processing';
import { DialogService, Column, TableModule, createOperationColumn } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';

import { createCurrencyColumn } from '@cc/app/shared';
import { DetailsDialogComponent } from '@cc/app/shared/components/details-dialog/details-dialog.component';

import { getUnionKey } from '../../../../utils';
import { ChangeChargebacksStatusDialogComponent } from '../change-chargebacks-status-dialog';

@UntilDestroy()
@Component({
    standalone: true,
    selector: 'cc-chargebacks',
    templateUrl: './chargebacks.component.html',
    imports: [CommonModule, TableModule],
})
export class ChargebacksComponent {
    @Input() chargebacks: InvoicePaymentChargeback[];
    @Input() paymentId: string;
    @Input() invoiceId: string;

    columns: Column<InvoicePaymentChargeback>[] = [
        'chargeback.id',
        {
            field: 'status',
            type: 'tag',
            formatter: (d) => getUnionKey(d.chargeback.status),
            typeParameters: {
                label: (d) => startCase(getUnionKey(d.chargeback.status)),
                tags: {
                    pending: { color: 'pending' },
                    accepted: { color: 'success' },
                    rejected: { color: 'warn' },
                    cancelled: { color: 'neutral' },
                },
            },
        },
        { field: 'chargeback.created_at', type: 'datetime' },
        createCurrencyColumn(
            'body',
            (d) => d.chargeback.body.amount,
            (d) => d.chargeback.body.currency.symbolic_code,
        ),
        createCurrencyColumn(
            'levy',
            (d) => d.chargeback.levy.amount,
            (d) => d.chargeback.levy.currency.symbolic_code,
        ),
        { field: 'stage', formatter: (d) => getUnionKey(d.chargeback.stage) },
        createOperationColumn([
            {
                label: 'Details',
                click: (d) => this.showDetails(d),
            },
            {
                label: 'Change status',
                click: (d) => this.changeStatus(d.chargeback.id),
            },
        ]),
    ];

    constructor(private dialogService: DialogService) {}

    changeStatus(id: string) {
        this.dialogService.open(ChangeChargebacksStatusDialogComponent, {
            chargebacks: [
                {
                    payment_id: this.paymentId,
                    invoice_id: this.invoiceId,
                    chargeback_id: id,
                },
            ],
        });
    }

    showDetails(chargeback: InvoicePaymentChargeback) {
        this.dialogService.open(DetailsDialogComponent, {
            title: 'Chargeback details',
            json: chargeback,
        });
    }
}
