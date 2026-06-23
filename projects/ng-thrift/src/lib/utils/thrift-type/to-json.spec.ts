import { toJson } from './to-json';

describe('toJson', () => {
    it('Map and Set inside object, inside array', () => {
        expect(toJson([{ a: new Map([['a', new Set([1, 2, 3])]]) }])).toEqual([
            { a: [['a', [1, 2, 3]]] },
        ]);
    });
    it('string', () => {
        expect(toJson('test')).toEqual('test');
    });
    it('null', () => {
        expect(toJson(null)).toEqual(null);
    });
    it('undefined', () => {
        expect(toJson(undefined)).toEqual(undefined);
    });
    it('empty object', () => {
        expect(toJson({})).toEqual({});
    });
    it('empty array', () => {
        expect(toJson([])).toEqual([]);
    });
});
