import { map } from 'rxjs';

import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';

import { observableResource } from '@vality/matez';

import { ThriftWebhooksManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { DomainThriftViewerComponent } from '~/components/thrift-api-crud';

@Component({
    selector: 'cc-wallet-webhook',
    imports: [DomainThriftViewerComponent, PageLayoutModule, MatCardModule],
    templateUrl: './wallet-webhook.component.html',
})
export class WalletWebhookComponent {
    private route = inject(ActivatedRoute);
    private webhooksManagementService = inject(ThriftWebhooksManagementService);

    webhook = observableResource({
        params: this.route.params.pipe(map((p) => Number(p['webhookID']))),
        loader: (id) => this.webhooksManagementService.Get(id),
    });
}
