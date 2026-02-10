import { distinctUntilChanged, map, of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { WebhookParams } from '@vality/fistful-proto/webhooker';
import {
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    getValueChanges,
    progressTo,
} from '@vality/matez';
import { isTypeWithAliases } from '@vality/ng-thrift';

import { ThriftWalletWebhooksManagementService } from '~/api/services';
import { FistfulThriftFormComponent } from '~/components/fistful-thrift-form';
import { DomainMetadataFormExtensionsService } from '~/components/thrift-api-crud';

@Component({
    selector: 'cc-create-wallet-webhook-dialog',
    imports: [
        CommonModule,
        DialogModule,
        FistfulThriftFormComponent,
        ReactiveFormsModule,
        MatButtonModule,
    ],
    templateUrl: './create-wallet-webhook-dialog.component.html',
})
export class CreateWalletWebhookDialogComponent extends DialogSuperclass<
    CreateWalletWebhookDialogComponent,
    { partyId: string }
> {
    private walletWebhooksManagementService = inject(ThriftWalletWebhooksManagementService);
    private log = inject(NotifyLogService);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);

    control = new FormControl<Partial<WebhookParams>>(
        { party_id: this.dialogData.partyId },
        { nonNullable: true },
    );
    progress = signal(0);
    extensions$ = this.domainMetadataFormExtensionsService.createFullDomainObjectsOptionsByType(
        'WalletConfigObject',
        'wallet_config',
        getValueChanges(this.control).pipe(
            map((value) => value?.party_id ?? this.dialogData.partyId),
            distinctUntilChanged(),
            map((partyId) => (obj) => obj.object.wallet_config.data.party_ref.id === partyId),
        ),
        (data) => of(isTypeWithAliases(data, 'WalletID', 'webhooker')),
    );

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
