import { catchError, first, of, switchMap } from 'rxjs';

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { Webhook } from '@vality/fistful-proto/webhooker';
import {
    Column,
    DialogService,
    NotifyLogService,
    TableModule,
    TableResourceComponent,
    observableResource,
} from '@vality/matez';

import { ThriftWebhooksManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { createWalletColumn } from '~/utils';

import { getUnionKey } from '../../../../../projects/ng-thrift/src/lib/utils/union/get-union-key';
import { PartyStoreService } from '../party-store.service';

import { CreateWebhookDialogComponent } from './create-webhook-dialog/create-webhook-dialog.component';

@Component({
    selector: 'cc-webhooks',
    imports: [PageLayoutModule, TableModule, TableResourceComponent, MatButtonModule],
    templateUrl: './webhooks.component.html',
})
export class WebhooksComponent {
    private webhooksManagementService = inject(ThriftWebhooksManagementService);
    private partyStoreService = inject(PartyStoreService);
    private log = inject(NotifyLogService);
    private dialogService = inject(DialogService);

    webhooks = observableResource({
        params: this.partyStoreService.party$,
        loader: (party) =>
            this.webhooksManagementService.GetList(party.ref.id).pipe(
                catchError((err) => {
                    this.log.error(err);
                    return of([] as Webhook[]);
                }),
            ),
    });

    columns: Column<Webhook>[] = [
        { field: 'id' },
        {
            field: 'enabled',
            cell: (d) => ({
                type: 'boolean',
                value: d.enabled ? 'Enabled' : 'Disabled',
                color: d.enabled ? 'success' : 'warn',
            }),
        },
        createWalletColumn((d) => ({ id: d.wallet_id })),
        {
            field: 'event_filter',
            cell: (d) => ({
                value: Array.from(d.event_filter.types)
                    .map((type) =>
                        getUnionKey(type) === 'withdrawal'
                            ? getUnionKey(type.withdrawal)
                            : getUnionKey(type.destination),
                    )
                    .join(', '),
            }),
        },
        { field: 'url' },
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
}
