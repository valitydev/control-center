import { AsyncPipe } from '@angular/common';
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { getImportValue, formatCurrency } from '@vality/ng-core';
import { isTypeWithAliases, getUnionValue } from '@vality/ng-thrift';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { PageLayoutModule } from '../../../../shared';
import { MetadataViewExtension } from '../../../../shared/components/json-viewer';
import { MagistaThriftViewerComponent } from '../../../../shared/components/thrift-api-crud';
import { DomainMetadataViewExtensionsService } from '../../../../shared/components/thrift-api-crud/domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { AmountCurrencyService } from '../../../../shared/services';
import { PaymentDetailsService } from '../../payment-details.service';

@Component({
    selector: 'cc-payment-details',
    standalone: true,
    imports: [AsyncPipe, MagistaThriftViewerComponent, MatCard, MatCardContent, PageLayoutModule],
    templateUrl: './payment-details.component.html',
    styles: ``,
})
export class PaymentDetailsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/magista-proto/metadata.json'));
    extensions$: Observable<MetadataViewExtension[]> = this.payment$.pipe(
        map((payment): MetadataViewExtension[] => [
            this.domainMetadataViewExtensionsService.createShopExtension(payment.owner_id),
            {
                determinant: (d) => of(isTypeWithAliases(d, 'Amount', 'domain')),
                extension: (_, amount: number) =>
                    this.amountCurrencyService.getCurrency(payment.currency_symbolic_code).pipe(
                        map((c) => ({
                            value: formatCurrency(
                                amount,
                                c.symbolic_code,
                                'long',
                                this._locale,
                                c.exponent,
                            ),
                        })),
                    ),
            },
            {
                determinant: (d) =>
                    of(
                        isTypeWithAliases(d, 'InvoicePaymentStatus', 'domain') ||
                            isTypeWithAliases(d, 'InvoicePaymentFlow', 'magista'),
                    ),
                extension: (_, v) => of({ hidden: !Object.keys(getUnionValue(v)).length }),
            },
            {
                determinant: (d) =>
                    of(
                        isTypeWithAliases(d?.trueParent, 'StatPayment', 'magista') &&
                            (d.field.name === 'make_recurrent' ||
                                d.field.name === 'currency_symbolic_code' ||
                                isTypeWithAliases(d, 'InvoiceID', 'domain') ||
                                isTypeWithAliases(d, 'InvoicePaymentID', 'domain')),
                    ),
                extension: () => of({ hidden: true }),
            },
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private amountCurrencyService: AmountCurrencyService,
        @Inject(LOCALE_ID) private _locale: string,
    ) {}
}
