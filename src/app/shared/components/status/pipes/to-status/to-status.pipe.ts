import { Pipe, PipeTransform } from '@angular/core';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

@Pipe({
    name: 'toStatus',
})
export class ToStatusPipe implements PipeTransform {
    transform(status: { [N in string]: unknown }): string {
        return startCase(getUnionKey(status));
    }
}
