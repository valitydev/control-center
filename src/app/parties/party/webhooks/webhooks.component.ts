import { Component, inject } from '@angular/core';

import { observableResource } from '@vality/matez';

import { ThriftWebhooksManagementService } from '~/api/services';

import { PartyStoreService } from '../party-store.service';

@Component({
    selector: 'cc-webhooks',
    imports: [],
    templateUrl: './webhooks.component.html',
})
export class WebhooksComponent {
    private webhooksManagementService = inject(ThriftWebhooksManagementService);
    private partyStoreService = inject(PartyStoreService);

    webhooks = observableResource({
        params: this.partyStoreService.party$,
        loader: (party) => this.webhooksManagementService.GetList(party.ref.id),
    });
}
