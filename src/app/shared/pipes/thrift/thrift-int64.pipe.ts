import { Pipe, PipeTransform } from '@angular/core';
import { Int64 } from '@vality/thrift-ts';

@Pipe({
    name: 'ccThriftInt64',
})
/**
 * @deprecated
 */
export class ThriftInt64Pipe implements PipeTransform {
    transform(value: Int64 | number): number {
        return typeof value === 'number' ? value : value.toNumber();
    }
}
