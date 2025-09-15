import { map } from 'rxjs';

import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';

import { observableResource } from '@vality/matez';

import { ThriftWalletWebhooksManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { FistfulThriftViewerComponent } from '~/components/thrift-api-crud/fistful';

@Component({
    selector: 'cc-wallet-webhook',
    imports: [FistfulThriftViewerComponent, PageLayoutModule, MatCardModule],
    templateUrl: './wallet-webhook.component.html',
})
export class WalletWebhookComponent {
    private route = inject(ActivatedRoute);
    private webhooksManagementService = inject(ThriftWalletWebhooksManagementService);

    webhook = observableResource({
        params: this.route.params.pipe(map((p) => Number(p['webhookID']))),
        loader: (id) => this.webhooksManagementService.Get(id),
    });
}
