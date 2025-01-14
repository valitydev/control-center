// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isThriftObject(value: any): boolean {
    return typeof value?.['write'] === 'function' && typeof value?.['read'] === 'function';
}
