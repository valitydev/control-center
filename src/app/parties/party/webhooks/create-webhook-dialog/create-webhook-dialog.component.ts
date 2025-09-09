import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { WebhookParams } from '@vality/domain-proto/webhooker';
import { DialogModule, DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';

import { ThriftWebhooksManagementService } from '~/api/services';
import { DomainThriftFormComponent } from '~/components/thrift-api-crud';

@Component({
    selector: 'cc-create-webhook-dialog',
    imports: [DialogModule, DomainThriftFormComponent, ReactiveFormsModule, MatButtonModule],
    templateUrl: './create-webhook-dialog.component.html',
})
export class CreateWebhookDialogComponent extends DialogSuperclass<
    CreateWebhookDialogComponent,
    { partyId: string }
> {
    private webhooksManagementService = inject(ThriftWebhooksManagementService);
    private log = inject(NotifyLogService);

    control = new FormControl<Partial<WebhookParams>>(
        { party_ref: { id: this.dialogData.partyId } },
        { nonNullable: true },
    );
    progress = signal(0);

    create() {
        this.webhooksManagementService
            .Create(this.control.value as WebhookParams)
            .pipe(progressTo(this.progress))
            .subscribe(() => {
                this.log.success('Webhook created');
                this.closeWithSuccess();
            });
    }
}
