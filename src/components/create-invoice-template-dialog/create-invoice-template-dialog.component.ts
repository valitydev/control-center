import { EMPTY } from 'rxjs';

import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form, min } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { InvoiceTemplateCreateParams } from '@vality/domain-proto/api_extensions';
import { LifetimeInterval } from '@vality/domain-proto/domain';
import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    observableResource,
} from '@vality/matez';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { ThriftInvoiceTemplatingService } from '~/api/services';

import { MerchantFieldModule } from '../merchant-field';
import { ShopFieldModule } from '../shop-field';
import { DomainMetadataFormExtensionsService, DomainThriftFormComponent } from '../thrift-api-crud';

interface PaymentLinkParams extends Pick<
    InvoiceTemplateCreateParams,
    'party_id' | 'shop_id' | 'details'
> {
    lifetime: number;
    lifetimeUnit: keyof LifetimeInterval;
    name: string;
    description: string;
    email: string;
    redirectUrl: string;
    cancelUrl: string;
    locale: string;
}

@Component({
    templateUrl: './create-invoice-template-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        CommonModule,
        DialogModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        InputFieldModule,
        MatDividerModule,
        FormField,
        ShopFieldModule,
        MerchantFieldModule,
    ],
})
export class CreateInvoiceTemplateDialogComponent extends DialogSuperclass<CreateInvoiceTemplateDialogComponent> {
    private invoiceTemplatingService = inject(ThriftInvoiceTemplatingService);
    private log = inject(NotifyLogService);
    private clipboard = inject(Clipboard);
    private dr = inject(DestroyRef);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);
    private domainStoreService = inject(DomainObjectsStoreService);

    lifetimeUnits: { value: keyof LifetimeInterval; label: string }[] = [
        { value: 'seconds', label: 'Seconds' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' },
    ];
    controlModel = signal<PaymentLinkParams>({
        lifetime: 30,
        lifetimeUnit: 'days',
        name: '',
        description: '',
        email: '',
        redirectUrl: '',
        cancelUrl: '',
        locale: '',

        party_id: null,
        shop_id: null,
        details: null,
    });
    control = form(this.controlModel, (path) => {
        min(path.lifetime, 1, { message: 'Lifetime must be at least 1' });
    });
    invoiceTemplate = observableResource({
        params: EMPTY,
        loader: ({
            shop_id,
            party_id,
            details,
            lifetime,
            lifetimeUnit,
            ...params
        }: PaymentLinkParams) =>
            this.invoiceTemplatingService.Create({
                shop_id,
                party_id,
                details,
                invoice_lifetime: { [lifetimeUnit]: lifetime },
                url_params: new Map(Object.entries(params)),
                context: { type: 'application/json', data: '{}' },
            }),
    });

    onInit() {
        this.invoiceTemplate.value$.pipe(takeUntilDestroyed(this.dr)).subscribe((result) => {
            this.clipboard.copy(result.invoice_template_url.url);
            this.log.success('Link copied to clipboard');
        });
    }

    createAndCopyLink() {
        this.invoiceTemplate.setParams(this.controlModel());
    }
}
