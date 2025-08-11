import { AsyncPipe } from '@angular/common';
import { Component, LOCALE_ID, inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { metadata$ } from '@vality/magista-proto';
import { formatCurrency } from '@vality/matez';
import { ThriftViewExtension, getUnionValue, isTypeWithAliases } from '@vality/ng-thrift';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { AmountCurrencyService } from '../../../../../services';
import { PageLayoutModule } from '../../../../shared';
import { MagistaThriftViewerComponent } from '../../../../shared/components/thrift-api-crud';
import { DomainMetadataViewExtensionsService } from '../../../../shared/components/thrift-api-crud/domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { PaymentDetailsService } from '../../payment.service';

@Component({
    selector: 'cc-payment-details',
    imports: [AsyncPipe, MagistaThriftViewerComponent, MatCard, MatCardContent, PageLayoutModule],
    templateUrl: './payment-details.component.html',
    styles: ``,
})
export class PaymentDetailsComponent {
    private paymentDetailsService = inject(PaymentDetailsService);
    private domainMetadataViewExtensionsService = inject(DomainMetadataViewExtensionsService);
    private amountCurrencyService = inject(AmountCurrencyService);
    private _locale = inject<string>(LOCALE_ID);
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    metadata$ = metadata$;
    extensions$: Observable<ThriftViewExtension[]> = this.payment$.pipe(
        map((payment): ThriftViewExtension[] => [
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
}
