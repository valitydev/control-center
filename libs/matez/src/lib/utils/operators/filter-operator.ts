export function filterOperator<T>(...operators: [T | undefined]) {
    return operators.filter(Boolean) as [T];
}
