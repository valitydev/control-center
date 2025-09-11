import { catchError, filter, first, of, switchMap } from 'rxjs';

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import { Webhook } from '@vality/domain-proto/webhooker';
import {
    Column,
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
    TableModule,
    TableResourceComponent,
    createMenuColumn,
    observableResource,
} from '@vality/matez';

import { ThriftShopWebhooksManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { createShopColumn } from '~/utils';

import { getUnionKey } from '../../../../../projects/ng-thrift/src/lib/utils/union/get-union-key';
import { PartyStoreService } from '../party-store.service';

import { CreateWebhookDialogComponent } from './create-webhook-dialog/create-webhook-dialog.component';

@Component({
    selector: 'cc-webhooks',
    imports: [PageLayoutModule, TableModule, TableResourceComponent, MatButtonModule],
    templateUrl: './webhooks.component.html',
})
export class WebhooksComponent {
    private webhooksManagementService = inject(ThriftShopWebhooksManagementService);
    private partyStoreService = inject(PartyStoreService);
    private log = inject(NotifyLogService);
    private dialogService = inject(DialogService);
    private router = inject(Router);

    webhooks = observableResource({
        params: this.partyStoreService.party$,
        loader: (party) =>
            this.webhooksManagementService.GetList(party.ref).pipe(
                catchError((err) => {
                    this.log.error(err);
                    return of([] as Webhook[]);
                }),
            ),
    });

    columns: Column<Webhook>[] = [
        {
            field: 'id',
            cell: (d) => ({
                value: String(d.id),
                click: () =>
                    this.router.navigate(['/parties', d.party_ref.id, 'shop-webhooks', d.id]),
            }),
        },
        { field: 'url' },
        {
            field: 'enabled',
            cell: (d) => ({
                type: 'boolean',
                value: d.enabled ? 'Enabled' : 'Disabled',
                color: d.enabled ? 'success' : 'warn',
            }),
        },
        createShopColumn((d) => ({ shopId: d.event_filter.invoice.shop_ref.id }), {
            header: 'Event Filter Invoice Shop',
        }),
        {
            field: 'event_filter_invoice_types',
            cell: (d) => ({
                value: Array.from(d.event_filter.invoice.types)
                    .map((type) => getUnionKey(type))
                    .join(', '),
            }),
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () =>
                        this.router.navigate(['/parties', d.party_ref.id, 'shop-webhooks', d.id]),
                },
                {
                    label: 'Delete',
                    click: () => this.delete(d.id),
                },
            ],
        })),
    ];

    create() {
        this.partyStoreService.party$
            .pipe(
                first(),
                switchMap((party) =>
                    this.dialogService
                        .open(CreateWebhookDialogComponent, { partyId: party.ref.id })
                        .afterClosed(),
                ),
            )
            .subscribe((result) => {
                if (result.status === 'success') {
                    this.webhooks.reload();
                }
            });
    }

    delete(id: number) {
        this.dialogService
            .open(ConfirmDialogComponent)
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() => this.webhooksManagementService.Delete(id)),
            )
            .subscribe({
                next: () => {
                    this.log.successOperation('delete', 'Webhook');
                    this.webhooks.reload();
                },
                error: (err) => {
                    this.log.errorOperation(err, 'delete', 'Webhook');
                },
            });
    }
}
