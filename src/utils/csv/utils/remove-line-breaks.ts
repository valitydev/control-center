export function removeLineBreaks(str: string): string {
    return str.replace(/^[\r\n\s]+|[\r\n\s]+$/g, '');
}
