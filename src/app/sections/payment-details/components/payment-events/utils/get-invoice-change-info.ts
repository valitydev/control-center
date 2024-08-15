import { InvoiceChange, Event } from '@vality/domain-proto/internal/payment_processing';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import isEmpty from 'lodash-es/isEmpty';
import startCase from 'lodash-es/startCase';

import { StatusColor } from '../../../../../styles';

function getKeyTitle(v: unknown) {
    return String(v).replaceAll('_', ' ');
}

export function getInvoiceChangeInfo(e: Event, change: InvoiceChange) {
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
                                payload.invoice_payment_risk_score_changed.risk_score
                            ]
                        } (${payload.invoice_payment_risk_score_changed.risk_score})`,
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
                case 'invoice_payment_status_changed': {
                    const statusChange = {
                        change: payload.invoice_payment_status_changed.status,
                        type: 'InvoicePaymentStatus',
                        namespace: 'domain',
                        title: `Invoice payment status changed to ${getKeyTitle(
                            getUnionKey(payload.invoice_payment_status_changed.status),
                        )}`,
                        expansionTitle: startCase(
                            getKeyTitle(getUnionKey(payload.invoice_payment_status_changed.status)),
                        ),
                        date: e.created_at,
                        icon: 'priority_high',
                    };
                    switch (getUnionKey(payload.invoice_payment_status_changed.status)) {
                        case 'pending':
                            return {
                                ...statusChange,
                                color: 'pending',
                                icon: 'pending',
                                change: null,
                            };
                        case 'processed':
                            return {
                                ...statusChange,
                                color: 'pending',
                                icon: 'process_chart',
                                change: null,
                            };
                        case 'captured':
                            return { ...statusChange, color: 'success', icon: 'check' };
                        case 'cancelled':
                            return { ...statusChange, color: 'neutral', icon: 'block' };
                        case 'refunded':
                            return {
                                ...statusChange,
                                color: 'success',
                                icon: 'undo',
                                change: null,
                            };
                        case 'failed':
                            return { ...statusChange, color: 'warn', icon: 'priority_high' };
                        case 'charged_back':
                            return {
                                ...statusChange,
                                color: 'success',
                                icon: 'undo',
                                change: null,
                            };
                    }
                    return statusChange;
                }
                case 'invoice_payment_session_change': {
                    const sessionChange = {
                        change: payload.invoice_payment_session_change,
                        type: 'InvoicePaymentSessionChange',
                        namespace: 'payment_processing',
                        title: `Invoice payment ${getKeyTitle(
                            getUnionKey(payload.invoice_payment_session_change.payload),
                        )}`,
                        expansionTitle: startCase(
                            getKeyTitle(
                                getUnionKey(payload.invoice_payment_session_change.payload),
                            ),
                        ),
                        date: e.created_at,
                        icon: 'edit',
                    };
                    switch (getUnionKey(payload.invoice_payment_session_change.payload)) {
                        case 'session_started':
                            return {
                                ...sessionChange,
                                icon: 'line_start',
                            };
                        case 'session_finished':
                            return {
                                ...sessionChange,
                                color: {
                                    succeeded: StatusColor.Success,
                                    failed: StatusColor.Warn,
                                }[
                                    getUnionKey(
                                        payload.invoice_payment_session_change.payload
                                            .session_finished.result,
                                    )
                                ],
                                icon: 'line_end',
                            };
                        case 'session_suspended':
                            return {
                                ...sessionChange,
                                icon: 'pause',
                                color: 'pending',
                            };
                        case 'session_activated':
                            return {
                                ...sessionChange,
                                icon: 'line_start',
                            };
                        case 'session_transaction_bound':
                            return {
                                ...sessionChange,
                                icon: 'attach_file_add',
                            };
                        case 'session_proxy_state_changed':
                            return {
                                ...sessionChange,
                                icon: 'horizontal_distribute',
                            };
                        case 'session_interaction_changed':
                            return {
                                ...sessionChange,
                                icon: 'ads_click',
                            };
                    }
                    return sessionChange;
                }
                case 'invoice_payment_capture_started': {
                    return {
                        change: payload.invoice_payment_capture_started.data,
                        type: 'InvoicePaymentCaptureData',
                        namespace: 'payment_processing',
                        title: 'Invoice payment capture started',
                        expansionTitle: payload.invoice_payment_capture_started.data.reason,
                        date: e.created_at,
                        icon: 'capture',
                    };
                }
                // TODO: add internal
                case 'invoice_payment_chargeback_change': {
                    return {
                        change: payload.invoice_payment_chargeback_change.payload,
                        type: 'InvoicePaymentChargebackChangePayload',
                        namespace: 'payment_processing',
                        title: `Invoice payment chargeback #${payload.invoice_payment_chargeback_change.id} changed`,
                        expansionTitle: 'Chargeback change',
                        date: e.created_at,
                        icon: 'edit',
                    };
                }
                case 'invoice_payment_rollback_started': {
                    return {
                        change: payload.invoice_payment_rollback_started.reason,
                        type: 'OperationFailure',
                        namespace: 'domain',
                        title: 'Invoice payment rollback started',
                        expansionTitle: 'Reason',
                        date: e.created_at,
                        icon: 'start',
                    };
                }
                case 'invoice_payment_clock_update': {
                    return {
                        change: payload.invoice_payment_clock_update.clock,
                        type: 'AccounterClock',
                        namespace: 'domain',
                        title: 'Invoice payment clock updated',
                        expansionTitle: 'Clock',
                        date: e.created_at,
                        icon: 'more_time',
                    };
                }
                case 'invoice_payment_cash_changed': {
                    return {
                        change: payload.invoice_payment_cash_changed,
                        type: 'InvoicePaymentCashChanged',
                        namespace: 'payment_processing',
                        title: 'Invoice payment cash changed',
                        expansionTitle: 'Cash change',
                        date: e.created_at,
                        icon: 'price_change',
                    };
                }
                case 'invoice_payment_shop_limit_initiated': {
                    return {
                        title: 'Invoice payment shop limit initiated',
                        date: e.created_at,
                        icon: 'production_quantity_limits',
                    };
                }
                case 'invoice_payment_shop_limit_applied': {
                    return {
                        title: 'Invoice payment shop limit applied',
                        date: e.created_at,
                        icon: 'production_quantity_limits',
                        color: 'success',
                    };
                }
            }
        }
    }
    return {
        change: change,
        type: 'InvoiceChange',
        namespace: 'payment_processing',
        title: 'Invoice changed',
        expansionTitle: 'Invoice Change',
        date: e.created_at,
        icon: 'edit',
    };
}
