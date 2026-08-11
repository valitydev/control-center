import { ThriftData } from '../../models';

import { fromJson } from './from-json';

describe('fromJson', () => {
    it('restores maps and nested sets from their JSON representation', () => {
        const data = new ThriftData([], 'test', {
            name: 'map',
            keyType: 'string',
            valueType: { name: 'set', valueType: 'i64' },
        });

        expect(fromJson([['RUB', [1, 2]]], data)).toEqual(new Map([['RUB', new Set([1, 2])]]));
    });

    it('keeps thrift lists as arrays', () => {
        const data = new ThriftData([], 'test', {
            name: 'list',
            valueType: 'i64',
        });

        expect(fromJson([1, 2], data)).toEqual([1, 2]);
    });
});
