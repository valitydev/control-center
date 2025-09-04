import { catchError, of } from 'rxjs';

import { Component, inject } from '@angular/core';

import { Webhook } from '@vality/fistful-proto/webhooker';
import {
    Column,
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

@Component({
    selector: 'cc-webhooks',
    imports: [PageLayoutModule, TableModule, TableResourceComponent],
    templateUrl: './webhooks.component.html',
})
export class WebhooksComponent {
    private webhooksManagementService = inject(ThriftWebhooksManagementService);
    private partyStoreService = inject(PartyStoreService);
    private log = inject(NotifyLogService);

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
}
