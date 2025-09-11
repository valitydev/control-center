import { catchError, filter, first, of, switchMap } from 'rxjs';
import yaml from 'yaml';

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import { Webhook } from '@vality/fistful-proto/webhooker';
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
import { toJson } from '@vality/ng-thrift';

import { ThriftWalletWebhooksManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { createWalletColumn } from '~/utils';

import { getUnionKey } from '../../../../../projects/ng-thrift/src/lib/utils/union/get-union-key';
import { PartyStoreService } from '../party-store.service';

import { CreateWalletWebhookDialogComponent } from './create-wallet-webhook-dialog/create-wallet-webhook-dialog.component';

@Component({
    selector: 'cc-wallet-webhooks',
    imports: [PageLayoutModule, TableModule, TableResourceComponent, MatButtonModule],
    templateUrl: './wallet-webhooks.component.html',
})
export class WalletWebhooksComponent {
    private walletWebhooksManagementService = inject(ThriftWalletWebhooksManagementService);
    private partyStoreService = inject(PartyStoreService);
    private log = inject(NotifyLogService);
    private dialogService = inject(DialogService);
    private router = inject(Router);

    webhooks = observableResource({
        params: this.partyStoreService.party$,
        loader: (party) =>
            this.walletWebhooksManagementService.GetList(party.ref.id).pipe(
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
                click: () => this.router.navigate(['/parties', d.id, 'wallet-webhooks', d.id]),
            }),
        },
        { field: 'url' },
        {
            field: 'enabled',
            cell: (d) => ({
                value: d.enabled ? 'Enabled' : 'Disabled',
                color: d.enabled ? 'success' : 'warn',
            }),
        },
        createWalletColumn((d) => ({ id: d.wallet_id })),
        {
            field: 'event_filter_types',
            header: 'Event Filters',
            cell: (d) => ({
                value: Array.from(d.event_filter.types)
                    .map((type) => getUnionKey(type))
                    .join(', '),
                tooltip: yaml.stringify(toJson(d.event_filter.types)),
            }),
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () =>
                        this.router.navigate(['/parties', d.party_id, 'wallet-webhooks', d.id]),
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
                        .open(CreateWalletWebhookDialogComponent, { partyId: party.ref.id })
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
                switchMap(() => this.walletWebhooksManagementService.Delete(id)),
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
