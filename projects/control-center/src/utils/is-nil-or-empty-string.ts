export function isNilOrEmptyString(value: unknown): value is null | undefined | '' {
    return value === null || value === undefined || value === '';
}
