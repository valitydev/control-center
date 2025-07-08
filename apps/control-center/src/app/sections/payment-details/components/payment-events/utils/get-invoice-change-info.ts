import { Event, InvoiceChange } from '@vality/domain-proto/payment_processing';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { upperFirst } from 'lodash-es';
import isEmpty from 'lodash-es/isEmpty';
import startCase from 'lodash-es/startCase';

import { StatusColor } from '../../../../../styles/consts';

function getKeyTitle(v: unknown) {
    return String(v).replaceAll('_', ' ');
}

const STATUS_ICONS = {
    warn: 'priority_high',
    neutral: 'block',
    success: 'check',
    pending: 'pending',
};

export function getInvoiceChangeInfo(
    e: Event,
    change: InvoiceChange,
): {
    title: string;
    date: string;
    icon: string;
    change?: unknown;
    type?: string;
    namespace?: string;
    expansionTitle?: string;
    color?: StatusColor;
} {
    switch (getUnionKey(change)) {
        case 'invoice_created': {
            return {
                change: change.invoice_created.invoice,
                type: `Invoice ${change.invoice_created.invoice.id}`,
                namespace: 'domain',
                title: 'Invoice created',
                expansionTitle: 'Invoice',
                date: e.created_at,
                icon: 'request_quote',
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
                    unpaid: STATUS_ICONS.warn,
                    paid: STATUS_ICONS.success,
                    cancelled: STATUS_ICONS.neutral,
                    fulfilled: STATUS_ICONS.success,
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
                                color: StatusColor.Pending,
                                icon: 'pending',
                                change: null,
                            };
                        case 'processed':
                            return {
                                ...statusChange,
                                color: StatusColor.Pending,
                                icon: 'process_chart',
                                change: null,
                            };
                        case 'captured':
                            return { ...statusChange, color: StatusColor.Success, icon: 'check' };
                        case 'cancelled':
                            return { ...statusChange, color: StatusColor.Neutral, icon: 'block' };
                        case 'refunded':
                            return {
                                ...statusChange,
                                color: StatusColor.Success,
                                icon: 'undo',
                                change: null,
                            };
                        case 'failed':
                            return {
                                ...statusChange,
                                color: StatusColor.Warn,
                                icon: 'priority_high',
                            };
                        case 'charged_back':
                            return {
                                ...statusChange,
                                color: StatusColor.Success,
                                icon: 'undo',
                                change: null,
                            };
                        default:
                            return undefined;
                    }
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
                                color: StatusColor.Pending,
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
                        default:
                            return undefined;
                    }
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
                case 'invoice_payment_chargeback_change': {
                    const p = payload.invoice_payment_chargeback_change.payload;
                    const chargebackChange = {
                        change: p,
                        type: 'InvoicePaymentChargebackChangePayload',
                        namespace: 'payment_processing',
                        title: `${upperFirst(getKeyTitle(getUnionKey(p)))} #${
                            payload.invoice_payment_chargeback_change.id
                        }`,
                        expansionTitle: 'Chargeback change',
                        date: e.created_at,
                        icon: 'edit',
                    };
                    switch (getUnionKey(p)) {
                        case 'invoice_payment_chargeback_created':
                            return {
                                ...chargebackChange,
                                change: p.invoice_payment_chargeback_created.chargeback,
                                type: 'InvoicePaymentChargeback',
                                namespace: 'domain',
                                expansionTitle: 'Chargeback',
                                icon: 'source_notes',
                            };
                        case 'invoice_payment_chargeback_status_changed':
                            return {
                                ...chargebackChange,
                                change: null,
                                title: `${chargebackChange.title} to ${getKeyTitle(
                                    getUnionKey(p.invoice_payment_chargeback_status_changed.status),
                                )}`,
                                icon: {
                                    pending: STATUS_ICONS.pending,
                                    accepted: STATUS_ICONS.success,
                                    rejected: STATUS_ICONS.warn,
                                    cancelled: STATUS_ICONS.neutral,
                                }[getUnionKey(p.invoice_payment_chargeback_status_changed.status)],
                                color: {
                                    pending: StatusColor.Pending,
                                    accepted: StatusColor.Success,
                                    rejected: StatusColor.Warn,
                                    cancelled: StatusColor.Neutral,
                                }[getUnionKey(p.invoice_payment_chargeback_status_changed.status)],
                            };
                        case 'invoice_payment_chargeback_cash_flow_changed':
                            return {
                                ...chargebackChange,
                                change: p.invoice_payment_chargeback_cash_flow_changed.cash_flow,
                                type: 'FinalCashFlow',
                                namespace: 'domain',
                                expansionTitle: 'Cash Flow',
                                icon: 'account_tree',
                            };
                        case 'invoice_payment_chargeback_body_changed':
                            return {
                                ...chargebackChange,
                                change: p.invoice_payment_chargeback_body_changed.body,
                                type: 'Cash',
                                namespace: 'domain',
                                expansionTitle: 'Cash',
                                icon: 'price_change',
                            };
                        case 'invoice_payment_chargeback_levy_changed':
                            return {
                                ...chargebackChange,
                                change: p.invoice_payment_chargeback_levy_changed.levy,
                                type: 'Cash',
                                namespace: 'domain',
                                expansionTitle: 'Cash',
                                icon: 'price_change',
                            };
                        case 'invoice_payment_chargeback_stage_changed':
                            return {
                                ...chargebackChange,
                                change: p.invoice_payment_chargeback_stage_changed.stage,
                                type: 'InvoicePaymentChargebackStage',
                                namespace: 'domain',
                                expansionTitle: 'Stage',
                            };
                        case 'invoice_payment_chargeback_target_status_changed':
                            return {
                                ...chargebackChange,
                                change: null,
                                title: `${chargebackChange.title} to ${getKeyTitle(
                                    getUnionKey(
                                        p.invoice_payment_chargeback_target_status_changed.status,
                                    ),
                                )}`,
                                icon: {
                                    pending: STATUS_ICONS.pending,
                                    accepted: STATUS_ICONS.success,
                                    rejected: STATUS_ICONS.warn,
                                    cancelled: STATUS_ICONS.neutral,
                                }[
                                    getUnionKey(
                                        p.invoice_payment_chargeback_target_status_changed.status,
                                    )
                                ],
                                color: {
                                    pending: StatusColor.Pending,
                                    accepted: StatusColor.Success,
                                    rejected: StatusColor.Warn,
                                    cancelled: StatusColor.Neutral,
                                }[
                                    getUnionKey(
                                        p.invoice_payment_chargeback_target_status_changed.status,
                                    )
                                ],
                            };
                        case 'invoice_payment_chargeback_clock_update':
                            return {
                                ...chargebackChange,
                                change: p.invoice_payment_chargeback_clock_update.clock,
                                type: 'AccounterClock',
                                namespace: 'domain',
                                expansionTitle: 'Clock',
                                icon: 'more_time',
                            };
                        default:
                            return undefined;
                    }
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
                        color: StatusColor.Success,
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
