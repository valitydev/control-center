import * as Sentry from '@sentry/angular';

import { ThriftLogParams } from '@vality/tsthrift';

export function createSentryThriftLogger() {
    return (event: ThriftLogParams) => {
        if (event.type !== 'error') return;
        Sentry.addBreadcrumb({
            category: 'thrift',
            type: 'http',
            level: 'warning',
            message: `${event.name} (${event.namespace} ${event.serviceName}) failed: ${event.error?.message || event.error?.name || 'Unknown error'}`,
            data: {
                errorType: event.error?.name,
                namespace: event.namespace,
                service: event.serviceName,
                method: event.name,
                ...(event.error?.status ? { status: event.error.status } : {}),
                ...(event.traceId ? { traceId: event.traceId } : {}),
            },
        });
    };
}
