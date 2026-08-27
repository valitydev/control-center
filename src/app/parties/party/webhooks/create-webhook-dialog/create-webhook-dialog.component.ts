import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import { InvoiceEventType, WebhookParams } from '@vality/domain-proto/webhooker';
import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    progressTo,
} from '@vality/matez';

import { ThriftShopWebhooksManagementService } from '~/api/services';
import { InvoiceEventTypesFieldComponent } from '~/components/invoice-event-types-field';
import { PartyShop, ShopMerchantFieldComponent } from '~/components/shop-merchant-field';

import { SHOP_INVOICE_EVENT_TYPES } from './consts/shop-invoice-event-types';

interface CreateWebhookModel {
    partyShop: PartyShop;
    url: string;
    eventTypes: InvoiceEventType[];
}

@Component({
    selector: 'cc-create-webhook-dialog',
    imports: [
        CommonModule,
        DialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        ShopMerchantFieldComponent,
        InputFieldModule,
        FormField,
        InvoiceEventTypesFieldComponent,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './create-webhook-dialog.component.html',
})
export class CreateWebhookDialogComponent extends DialogSuperclass<
    CreateWebhookDialogComponent,
    { partyId: string }
> {
    private webhooksManagementService = inject(ThriftShopWebhooksManagementService);
    private log = inject(NotifyLogService);

    controlModel = signal<CreateWebhookModel>({
        partyShop: {
            party_id: this.dialogData.partyId,
            shop_id: null,
        },
        url: '',
        eventTypes: [],
    });
    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.partyShop.party_id);
        required(schemaPath.partyShop.shop_id);
        required(schemaPath.url);
        required(schemaPath.eventTypes);
    });
    progress = signal(0);
    eventTypesStructure = SHOP_INVOICE_EVENT_TYPES as Record<string, unknown>;

    create() {
        const { partyShop, url, eventTypes } = this.controlModel();
        const params: WebhookParams = {
            party_ref: { id: partyShop.party_id },
            url,
            event_filter: {
                invoice: {
                    shop_ref: { id: partyShop.shop_id },
                    types: new Set(eventTypes),
                },
            },
        };

        this.webhooksManagementService
            .Create(params)
            .pipe(progressTo(this.progress))
            .subscribe(() => {
                this.log.success('Webhook created');
                this.closeWithSuccess();
            });
    }
}
