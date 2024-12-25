export function correctPriorities(
    priorities: number[],
    opts: {
        step: number;
        maxStep: number;
        start: number;
    } = {
        step: 1000,
        maxStep: 1000,
        start: 0,
    },
): number[] {
    if (!priorities.length) {
        return [];
    }
    const res: number[] = [opts.start];
    for (let i = 1; i < priorities.length; ++i) {
        const last = res.at(-1) ?? opts.start;
        if (priorities[i] === priorities[i - 1]) {
            res.push(last);
        } else if (priorities[i] <= last || priorities[i] > last + opts.maxStep) {
            res.push(last + opts.step);
        } else {
            res.push(priorities[i]);
        }
    }
    return res;
}
