import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { WebhookParams } from '@vality/fistful-proto/webhooker';
import { DialogModule, DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';

import { ThriftWalletWebhooksManagementService } from '~/api/services';
import { FistfulThriftFormComponent } from '~/components/fistful-thrift-form';

@Component({
    selector: 'cc-create-wallet-webhook-dialog',
    imports: [DialogModule, FistfulThriftFormComponent, ReactiveFormsModule, MatButtonModule],
    templateUrl: './create-wallet-webhook-dialog.component.html',
})
export class CreateWalletWebhookDialogComponent extends DialogSuperclass<
    CreateWalletWebhookDialogComponent,
    { partyId: string }
> {
    private walletWebhooksManagementService = inject(ThriftWalletWebhooksManagementService);
    private log = inject(NotifyLogService);

    control = new FormControl<Partial<WebhookParams>>(
        { party_id: this.dialogData.partyId },
        { nonNullable: true },
    );
    progress = signal(0);

    create() {
        this.walletWebhooksManagementService
            .Create(this.control.value as WebhookParams)
            .pipe(progressTo(this.progress))
            .subscribe(() => {
                this.log.success('Webhook created');
                this.closeWithSuccess();
            });
    }
}
