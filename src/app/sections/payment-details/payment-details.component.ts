import { ChangeDetectionStrategy, Component, DestroyRef, Inject, LOCALE_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { InvoicePaymentStatus, InvoicePaymentFlow } from '@vality/domain-proto/internal/domain';
import {
    DialogService,
    DialogResponseStatus,
    getImportValue,
    formatCurrency,
    Color,
} from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { Subject, merge, defer, Observable, of } from 'rxjs';
import { shareReplay, switchMap, map } from 'rxjs/operators';

import { InvoicingService } from '@cc/app/api/payment-processing';

import { getUnionKey, getUnionValue } from '../../../utils';
import { MetadataViewExtension } from '../../shared/components/json-viewer';
import { isTypeWithAliases } from '../../shared/components/metadata-form';
import { DomainMetadataViewExtensionsService } from '../../shared/components/thrift-api-crud/domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { AmountCurrencyService } from '../../shared/services';

import { CreateChargebackDialogComponent } from './create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsService } from './payment-details.service';

@Component({
    templateUrl: 'payment-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentDetailsService],
})
export class PaymentDetailsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;

    chargebacks$ = merge(
        this.route.params,
        defer(() => this.updateChargebacks$),
    ).pipe(
        map(() => this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>),
        switchMap(({ invoiceID, paymentID }) =>
            this.invoicingService.GetPayment(invoiceID, paymentID),
        ),
        map(({ chargebacks }) => chargebacks),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
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
                                c.data.symbolic_code,
                                'long',
                                this._locale,
                                c.data.exponent,
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
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    tags$ = this.payment$.pipe(
        map((payment) => [
            {
                value: startCase(getUnionKey(payment.status)),
                color: (
                    {
                        captured: 'success',
                        refunded: 'success',
                        charged_back: 'success',
                        pending: 'pending',
                        processed: 'pending',
                        cancelled: 'warn',
                        failed: 'warn',
                    } as Record<keyof InvoicePaymentStatus, Color>
                )[getUnionKey(payment.status)],
            },
            {
                value: startCase(getUnionKey(payment.flow)),
                color: (
                    {
                        instant: 'success',
                        hold: 'pending',
                    } as Record<keyof InvoicePaymentFlow, Color>
                )[getUnionKey(payment.flow)],
            },
            {
                value: payment.make_recurrent ? 'Recurrent' : 'Not Recurrent',
                color: payment.make_recurrent ? 'success' : 'neutral',
            },
        ]),
    );

    private updateChargebacks$ = new Subject<void>();

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private route: ActivatedRoute,
        private invoicingService: InvoicingService,
        private dialogService: DialogService,
        private destroyRef: DestroyRef,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private amountCurrencyService: AmountCurrencyService,
        @Inject(LOCALE_ID) private _locale: string,
    ) {}

    createChargeback() {
        this.dialogService
            .open(
                CreateChargebackDialogComponent,
                this.route.snapshot.params as Record<'invoiceID' | 'paymentID', string>,
            )
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ status }) => {
                if (status === DialogResponseStatus.Success) {
                    this.updateChargebacks$.next();
                }
            });
    }
}
