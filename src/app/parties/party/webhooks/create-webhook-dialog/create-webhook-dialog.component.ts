import { distinctUntilChanged, map } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { WebhookParams } from '@vality/domain-proto/webhooker';
import {
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    getValueChanges,
    progressTo,
} from '@vality/matez';

import { ThriftShopWebhooksManagementService } from '~/api/services';
import {
    DomainMetadataFormExtensionsService,
    DomainThriftFormComponent,
} from '~/components/thrift-api-crud';

@Component({
    selector: 'cc-create-webhook-dialog',
    imports: [
        CommonModule,
        DialogModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        MatButtonModule,
    ],
    templateUrl: './create-webhook-dialog.component.html',
})
export class CreateWebhookDialogComponent extends DialogSuperclass<
    CreateWebhookDialogComponent,
    { partyId: string }
> {
    private webhooksManagementService = inject(ThriftShopWebhooksManagementService);
    private log = inject(NotifyLogService);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);

    control = new FormControl<Partial<WebhookParams>>(
        { party_ref: { id: this.dialogData.partyId } },
        { nonNullable: true },
    );
    progress = signal(0);
    extensions$ = this.domainMetadataFormExtensionsService.createFullDomainObjectsOptionsByType(
        'ShopConfigObject',
        'shop_config',
        getValueChanges(this.control).pipe(
            map((value) => value?.party_ref?.id ?? this.dialogData.partyId),
            distinctUntilChanged(),
            map((partyId) => (obj) => obj.object.shop_config.data.party_ref.id === partyId),
        ),
    );

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
