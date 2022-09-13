export const toMinor = (amount: number, exponent = 2): number =>
    Math.round(amount * 10 ** exponent);
