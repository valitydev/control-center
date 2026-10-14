import { capitalize, lowerCase } from 'lodash-es';

import { DEFAULT_ERROR_PARSER, LogError, inlineJson, isEmpty } from '@vality/matez';
import { isThriftError, isThriftServiceError } from '@vality/tsthrift';

export function parseThriftError(error: unknown): LogError {
    const trace =
        isThriftError(error) && error.context
            ? [
                  error.context.traceId,
                  `${error.context.namespace}.${error.context.serviceName}.${error.context.method}`,
              ]
                  .filter(Boolean)
                  .join(' ')
            : undefined;

    if (isThriftServiceError(error)) {
        const typeName = error.type.split('.').pop() || error.type;
        return {
            name: error.type,
            message: isEmpty(error.data)
                ? capitalize(lowerCase(typeName))
                : inlineJson(error.data, Infinity, true),
            details: error.data,
            trace,
            error,
            noConsole: true,
        };
    }
    return {
        ...DEFAULT_ERROR_PARSER(error),
        trace,
        noConsole: isThriftError(error),
    };
}
