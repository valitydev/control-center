import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import { EventType, WebhookParams } from '@vality/fistful-proto/webhooker';
import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    progressTo,
} from '@vality/matez';

import { ThriftWalletWebhooksManagementService } from '~/api/services';
import { EventTypesFieldComponent } from '~/components/event-types-field';
import { PartyWallet, WalletMerchantFieldComponent } from '~/components/wallet-merchant-field';

import { WALLET_EVENT_TYPES } from './consts/wallet-event-types';

interface CreateWalletWebhookModel {
    partyWallet: PartyWallet;
    url: string;
    eventTypes: EventType[];
}

@Component({
    selector: 'cc-create-wallet-webhook-dialog',
    imports: [
        CommonModule,
        DialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        WalletMerchantFieldComponent,
        InputFieldModule,
        FormField,
        EventTypesFieldComponent,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './create-wallet-webhook-dialog.component.html',
})
export class CreateWalletWebhookDialogComponent extends DialogSuperclass<
    CreateWalletWebhookDialogComponent,
    { partyId: string }
> {
    private walletWebhooksManagementService = inject(ThriftWalletWebhooksManagementService);
    private log = inject(NotifyLogService);

    walletEventTypes = WALLET_EVENT_TYPES as Record<string, unknown>;

    controlModel = signal<CreateWalletWebhookModel>({
        partyWallet: {
            party_id: this.dialogData.partyId,
            wallet_id: null,
        },
        url: '',
        eventTypes: [],
    });
    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.partyWallet.party_id);
        required(schemaPath.url);
        required(schemaPath.eventTypes);
    });
    progress = signal(0);

    create() {
        const { partyWallet, url, eventTypes } = this.controlModel();
        const params: WebhookParams = {
            party_id: partyWallet.party_id,
            ...(partyWallet.wallet_id ? { wallet_id: partyWallet.wallet_id } : {}),
            url,
            event_filter: {
                types: new Set(eventTypes),
            },
        };

        this.walletWebhooksManagementService
            .Create(params)
            .pipe(progressTo(this.progress))
            .subscribe(() => {
                this.log.success('Webhook created');
                this.closeWithSuccess();
            });
    }
}
