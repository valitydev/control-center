import { EMPTY, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';

import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    OnInit,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { InvoiceTemplateCreateParams } from '@vality/domain-proto/api_extensions';
import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    observableResource,
} from '@vality/matez';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { ThriftInvoiceTemplatingService } from '~/api/services';

import { Duration, DurationFieldComponent } from '../duration-field';
import { InvoiceTemplateDetailsFieldComponent } from '../invoice-template-details-field';
import { PartyShop, ShopMerchantFieldComponent } from '../shop-merchant-field';

interface PaymentLinkParams extends Pick<InvoiceTemplateCreateParams, 'details'> {
    partyShop: PartyShop;
    lifetime: Duration;
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
        ReactiveFormsModule,
        InputFieldModule,
        FormField,
        DurationFieldComponent,
        InvoiceTemplateDetailsFieldComponent,
        ShopMerchantFieldComponent,
        MatButtonModule,
        MatDivider,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
    ],
})
export class CreateInvoiceTemplateDialogComponent
    extends DialogSuperclass<CreateInvoiceTemplateDialogComponent>
    implements OnInit
{
    private invoiceTemplatingService = inject(ThriftInvoiceTemplatingService);
    private log = inject(NotifyLogService);
    private clipboard = inject(Clipboard);
    private dr = inject(DestroyRef);
    private domainStoreService = inject(DomainObjectsStoreService);

    controlModel = signal<PaymentLinkParams>({
        lifetime: { unit: 'days', amount: 30 },
        name: '',
        description: '',
        email: '',
        redirectUrl: '',
        cancelUrl: '',
        locale: '',

        partyShop: {
            party_id: null,
            shop_id: null,
        },
        details: null,
    });
    control = form(this.controlModel);
    currency$ = toObservable(this.controlModel).pipe(
        map(({ partyShop }) => partyShop.shop_id),
        distinctUntilChanged(),
        switchMap((shopId) =>
            shopId
                ? this.domainStoreService.getObject({ shop_config: { id: shopId } }).value$
                : of(null),
        ),
        map(
            (shop) =>
                shop?.object?.shop_config?.data?.account?.currency?.symbolic_code ?? undefined,
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    invoiceTemplate = observableResource({
        params: EMPTY,
        loader: ({ partyShop, details, lifetime, ...params }: PaymentLinkParams) =>
            this.invoiceTemplatingService
                .Create({
                    shop_id: { id: partyShop.shop_id },
                    party_id: { id: partyShop.party_id },
                    details,
                    invoice_lifetime: { [lifetime.unit]: lifetime.amount },
                    url_params: new Map(Object.entries(params)),
                    context: { type: 'application/json', data: '{}' },
                })
                .pipe(
                    catchError((err) => {
                        this.log.error(err, 'Failed to create payment link');
                        return EMPTY;
                    }),
                ),
    });

    ngOnInit() {
        this.invoiceTemplate.value$.pipe(takeUntilDestroyed(this.dr)).subscribe((result) => {
            this.clipboard.copy(result.invoice_template_url.url);
            this.log.success('Link copied to clipboard');
        });
    }

    createAndCopyLink() {
        this.invoiceTemplate.setParams(this.controlModel());
    }

    copyLink() {
        this.invoiceTemplate.getFirstValue().subscribe((result) => {
            this.clipboard.copy(result.invoice_template_url.url);
            this.log.success('Link copied to clipboard');
        });
    }
}
