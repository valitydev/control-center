export function getProgressByCount(count: number, completedCount: number = Number.MIN_VALUE) {
    return 1 - completedCount / count;
}
