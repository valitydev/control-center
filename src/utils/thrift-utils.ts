export function clearNullFields(union: any): any {
    if (!union) {
        return;
    }
    const filtered = Object.entries(union).filter(([, v]) => v !== null);
    let result = {};
    for (const [key, val] of filtered) {
        result = {
            ...result,
            [key]: val,
        };
    }
    return result;
}
