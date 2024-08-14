import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { HumanizedDurationPipe } from '@vality/ng-core';
import { ThriftPipesModule, getUnionKey, getUnionValue } from '@vality/ng-thrift';
import isEmpty from 'lodash-es/isEmpty';
import { switchMap } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { TimelineModule } from '../../../../../components/timeline';
import { InvoicingService } from '../../../../api/payment-processing';
import { PageLayoutModule } from '../../../../shared';
import { DomainThriftViewerComponent } from '../../../../shared/components/thrift-api-crud';
import { StatusColor } from '../../../../styles';
import { PaymentDetailsService } from '../../payment-details.service';

import { TimelineItemHeaderComponent } from './components/timeline-item-header/timeline-item-header.component';

function getKeyTitle(v: unknown) {
    return String(v).replaceAll('_', ' ');
}

@Component({
    selector: 'cc-payment-events',
    standalone: true,
    imports: [
        CommonModule,
        PageLayoutModule,
        TimelineModule,
        MatIcon,
        HumanizedDurationPipe,
        ThriftPipesModule,
        DomainThriftViewerComponent,
        MatExpansionModule,
        TimelineItemHeaderComponent,
    ],
    templateUrl: './payment-events.component.html',
    styles: ``,
})
export class PaymentEventsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    events$ = this.payment$.pipe(
        switchMap((payment) => this.invoicingService.GetEvents(payment.invoice_id, {})),
        map((events) =>
            events.flatMap((e) =>
                (e.payload.invoice_changes || []).map((change) => {
                    switch (getUnionKey(change)) {
                        case 'invoice_created': {
                            return {
                                change: change.invoice_created.invoice,
                                type: `Invoice ${change.invoice_created.invoice.id}`,
                                namespace: 'domain',
                                title: 'Invoice created',
                                expansionTitle: 'Invoice',
                                date: e.created_at,
                                icon: 'create',
                            };
                        }
                        case 'invoice_status_changed': {
                            const status = change.invoice_status_changed.status;
                            return {
                                change: isEmpty(getUnionValue(status)) ? null : status,
                                type: 'InvoiceStatus',
                                namespace: 'domain',
                                title: `Invoice ${getKeyTitle(getUnionKey(status))}`,
                                expansionTitle: 'Details',
                                date: e.created_at,
                                icon: {
                                    unpaid: 'priority_high',
                                    paid: 'check',
                                    cancelled: 'block',
                                    fulfilled: 'check',
                                }[getUnionKey(status)],
                                color: {
                                    unpaid: StatusColor.Warn,
                                    paid: StatusColor.Success,
                                    cancelled: StatusColor.Neutral,
                                    fulfilled: StatusColor.Success,
                                }[getUnionKey(status)],
                            };
                        }
                        case 'invoice_payment_change': {
                            const res = {
                                title: 'Invoice payment change',
                                date: e.created_at,
                                icon: 'edit',
                            };
                            const payload = change.invoice_payment_change.payload;
                            switch (getUnionKey(payload)) {
                                case 'invoice_payment_started': {
                                    return {
                                        change: payload.invoice_payment_started,
                                        type: 'InvoicePaymentStarted',
                                        namespace: 'payment_processing',
                                        title: 'Invoice payment started',
                                        expansionTitle: 'Payment',
                                        date: e.created_at,
                                        icon: 'start',
                                    };
                                }
                                case 'invoice_payment_risk_score_changed': {
                                    return {
                                        title: `Risk score changed to ${
                                            { 9999: 'fatal', 100: 'high', 1: 'low' }[
                                                payload.invoice_payment_risk_score_changed
                                                    .risk_score
                                            ]
                                        } (${
                                            payload.invoice_payment_risk_score_changed.risk_score
                                        })`,
                                        date: e.created_at,
                                        icon: 'emergency',
                                        color: {
                                            9999: StatusColor.Warn,
                                            100: StatusColor.Pending,
                                            1: StatusColor.Success,
                                        }[payload.invoice_payment_risk_score_changed.risk_score],
                                    };
                                }
                                case 'invoice_payment_route_changed': {
                                    return {
                                        change: payload.invoice_payment_route_changed,
                                        type: 'InvoicePaymentRouteChanged',
                                        namespace: 'payment_processing',
                                        title: 'Invoice payment route changed',
                                        expansionTitle: 'Route',
                                        date: e.created_at,
                                        icon: 'alt_route',
                                    };
                                }
                                case 'invoice_payment_cash_flow_changed': {
                                    return {
                                        change: payload.invoice_payment_cash_flow_changed.cash_flow,
                                        type: 'FinalCashFlow',
                                        namespace: 'domain',
                                        title: 'Invoice payment cash flow changed',
                                        expansionTitle: 'Cash Flow',
                                        date: e.created_at,
                                        icon: 'account_tree',
                                    };
                                }
                                // TODO: switch
                                case 'invoice_payment_status_changed': {
                                    return {
                                        change: payload.invoice_payment_status_changed.status,
                                        type: 'InvoicePaymentStatus',
                                        namespace: 'domain',
                                        title: `Invoice payment status changed to ${getKeyTitle(
                                            getUnionKey(
                                                payload.invoice_payment_status_changed.status,
                                            ),
                                        )}`,
                                        expansionTitle: 'Status',
                                        date: e.created_at,
                                        icon: 'edit',
                                    };
                                }
                                case 'invoice_payment_session_change': {
                                    return {
                                        change: payload.invoice_payment_session_change,
                                        type: 'InvoicePaymentSessionChange',
                                        namespace: 'payment_processing',
                                        title: `Invoice payment ${getKeyTitle(
                                            getUnionKey(
                                                payload.invoice_payment_session_change.payload,
                                            ),
                                        )}`,
                                        expansionTitle: 'Session Change',
                                        date: e.created_at,
                                        icon: 'edit',
                                    };
                                }
                                case 'invoice_payment_capture_started': {
                                    return {
                                        change: payload.invoice_payment_capture_started.data,
                                        type: 'InvoicePaymentCaptureData',
                                        namespace: 'payment_processing',
                                        title: 'Invoice payment capture started',
                                        expansionTitle:
                                            payload.invoice_payment_capture_started.data.reason,
                                        date: e.created_at,
                                        icon: 'capture',
                                    };
                                }
                            }
                            return res;
                        }
                    }
                }),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private invoicingService: InvoicingService,
    ) {}
}
