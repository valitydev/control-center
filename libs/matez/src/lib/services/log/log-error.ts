import isObject from 'lodash-es/isObject';

export const DEFAULT_ERROR_NAME = 'Unknown error';

export class LogError {
    source!: Record<PropertyKey, unknown>;

    get name() {
        return String(this.source?.['name'] || DEFAULT_ERROR_NAME);
    }

    get message() {
        return String(this.source?.['message'] || this.name);
    }

    get cause() {
        return this.source?.['cause'];
    }

    get details() {
        return Object.fromEntries(
            Object.entries(this.source).filter(([k, v]) => k !== 'name' && k !== 'message' && v),
        );
    }

    constructor(error: unknown) {
        this.source = (isObject(error)
            ? error
            : new Error(
                  error ? String(error) : DEFAULT_ERROR_NAME,
              )) as unknown as LogError['source'];
    }

    getLogMessage(message?: string) {
        return [
            message && `Caught error: ${message}`,
            this.name && `Name: ${this.name}`,
            this.message && `Message: ${this.message}`,
            Object.keys(this.details).length && JSON.stringify(this.details, null, 2),
        ]
            .filter(Boolean)
            .join('\n');
    }
}
