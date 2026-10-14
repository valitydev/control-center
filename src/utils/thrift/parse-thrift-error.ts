import { capitalize, lowerCase } from 'lodash-es';

import { DEFAULT_ERROR_PARSER, LogError } from '@vality/matez';
import {
    ThriftConnectionError,
    ThriftHttpError,
    ThriftTimeoutError,
    isThriftError,
    isThriftServiceError,
    isThriftSystemError,
} from '@vality/tsthrift';

function getHttpErrorMessage(error: ThriftHttpError): string {
    switch (error.status) {
        case 401:
            return 'Unauthorized';
        case 403:
            return 'Access denied';
        case 404:
            return 'Service not found';
        default:
            if (error.status >= 500) {
                return 'Server error';
            }
            return error.statusText || 'Request failed';
    }
}

function getSystemErrorMessage(error: unknown): string {
    if (error instanceof ThriftTimeoutError) {
        return 'Request timed out';
    }
    if (error instanceof ThriftConnectionError) {
        return 'Network connection error';
    }
    if (error instanceof ThriftHttpError) {
        return getHttpErrorMessage(error);
    }
    return 'Service error';
}

export function parseThriftError(error: unknown): LogError {
    if (isThriftServiceError(error)) {
        const typeName = error.type.split('.').pop() || error.type;
        return {
            name: error.type,
            message: capitalize(lowerCase(typeName)),
            details: error.data,
            error,
            noConsole: true,
        };
    }
    if (isThriftSystemError(error)) {
        return {
            name: error.name,
            message: getSystemErrorMessage(error),
            error,
            noConsole: true,
        };
    }
    return {
        ...DEFAULT_ERROR_PARSER(error),
        noConsole: isThriftError(error),
    };
}

