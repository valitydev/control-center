import { correctPriorities } from './correct-priorities';

describe('correctPriorities', () => {
    it('empty', () => {
        expect(correctPriorities([])).toEqual([]);
    });

    it('1 element', () => {
        expect(correctPriorities([1])).toEqual([0]);
    });

    it('2 elements', () => {
        expect(correctPriorities([-100, 200])).toEqual([0, 200]);
    });

    it('3 elements', () => {
        expect(correctPriorities([0, 100, 200])).toEqual([0, 100, 200]);
    });

    it('reversed', () => {
        expect(correctPriorities([1000, 500, 3])).toEqual([0, 500, 1500]);
    });

    it('moved 1 element', () => {
        expect(correctPriorities([2, 3, 4, 5, 6, 1, 7, 8, 9, 10])).toEqual([
            0, 3, 4, 5, 6, 1006, 2006, 3006, 4006, 5006,
        ]);
    });

    it('moved 1 element to forward', () => {
        expect(correctPriorities([1, 2, 9, 3, 4, 5, 6, 7, 8, 10])).toEqual([
            0, 2, 9, 1009, 2009, 3009, 4009, 5009, 6009, 7009,
        ]);
    });

    it('between much max step', () => {
        expect(correctPriorities([0, 1000, 3000, 2000, 9000])).toEqual([0, 1000, 2000, 3000, 4000]);
    });

    it('equals', () => {
        expect(correctPriorities([0, 1000, 1000, 3000])).toEqual([0, 1000, 1000, 2000]);
    });
});
