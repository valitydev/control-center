export const wrapValuesToArray = (params: Record<string, unknown>): Record<string, unknown> =>
    Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: [v] }), {});
