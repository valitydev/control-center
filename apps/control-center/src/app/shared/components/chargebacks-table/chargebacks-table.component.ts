import {
    Component,
    DestroyRef,
    EventEmitter,
    Input,
    Output,
    booleanAttribute,
    inject,
    input,
    model,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { StatChargeback } from '@vality/magista-proto/magista';
import {
    Column,
    DialogResponseStatus,
    DialogService,
    LoadOptions,
    TableModule,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs';

import { createCurrencyColumn, createPartyColumn, createShopColumn } from '../../utils';
import { ChangeChargebacksStatusDialogComponent } from '../change-chargebacks-status-dialog';

@Component({
    selector: 'cc-chargebacks-table',
    templateUrl: './chargebacks-table.component.html',
    imports: [TableModule, MatButtonModule],
})
export class ChargebacksTableComponent {
    private dialogService = inject(DialogService);
    private dr = inject(DestroyRef);
    @Input() data!: StatChargeback[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    selected = model<StatChargeback[]>([]);
    onePayment = input(false, { transform: booleanAttribute });

    @Output() selectedChange = new EventEmitter<StatChargeback[]>();
    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column<StatChargeback>[] = [
        { field: 'chargeback_id', header: 'Id' },
        {
            field: 'chargeback_reason',
            header: 'Reason',
            cell: (d) => ({
                value: startCase(getUnionKey(d.chargeback_reason.category)),
                description: d.chargeback_reason.code,
            }),
        },
        {
            field: 'chargeback_status',
            header: 'Status',
            cell: (d) => ({
                value: startCase(getUnionKey(d.chargeback_status)),
                color: (
                    {
                        pending: 'pending',
                        accepted: 'success',
                        rejected: 'warn',
                        cancelled: 'neutral',
                    } as const
                )[getUnionKey(d.chargeback_status)],
            }),
        },
        createCurrencyColumn((d) => ({ amount: d.amount, code: d.currency_code.symbolic_code }), {
            header: 'Amount',
        }),
        createCurrencyColumn(
            (d) => ({ amount: d.levy_amount, code: d.levy_currency_code.symbolic_code }),
            { header: 'Levy Amount' },
        ),
        createCurrencyColumn((d) => ({ amount: d.fee, code: d.currency_code.symbolic_code }), {
            header: 'Fee',
        }),
        createCurrencyColumn(
            (d) => ({ amount: d.provider_fee, code: d.currency_code.symbolic_code }),
            { header: 'Provider Fee' },
        ),
        createCurrencyColumn(
            (d) => ({ amount: d.external_fee, code: d.currency_code.symbolic_code }),
            { header: 'External Fee' },
        ),
        {
            field: 'stage',
            cell: (d) => ({ value: startCase(getUnionKey(d.stage)) }),
        },
        {
            field: 'invoice_id',
            header: {
                value: 'Invoice Id',
                description: 'Payment Id',
            },
            cell: (d) => ({
                description: d.payment_id,
                link: () => `/party/${d.party_id}/invoice/${d.invoice_id}/payment/${d.payment_id}`,
            }),
            hidden: toObservable(this.onePayment),
        },
        {
            field: 'created_at',
            cell: { type: 'datetime' },
        },
        createPartyColumn((d) => ({ id: d.party_id }), { hidden: toObservable(this.onePayment) }),
        createShopColumn((d) => ({ shopId: d.shop_id, partyId: d.party_id }), {
            hidden: toObservable(this.onePayment),
        }),
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Change status',
                    click: () => {
                        this.changeStatus(d);
                    },
                },
            ],
        })),
    ];

    changeStatus(chargeback: StatChargeback) {
        this.dialogService.open(ChangeChargebacksStatusDialogComponent, {
            chargebacks: [
                {
                    payment_id: chargeback.payment_id,
                    invoice_id: chargeback.invoice_id,
                    chargeback_id: chargeback.chargeback_id,
                },
            ],
        });
    }

    changeStatuses() {
        this.dialogService
            .open(ChangeChargebacksStatusDialogComponent, { chargebacks: this.selected() })
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                takeUntilDestroyed(this.dr),
            )
            .subscribe(() => {
                this.update.emit();
            });
    }
}
