export function clearNullFields(union: unknown): unknown {
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
