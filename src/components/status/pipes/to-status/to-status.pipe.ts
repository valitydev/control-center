import startCase from 'lodash-es/startCase';

import { Pipe, PipeTransform } from '@angular/core';

import { getUnionKey } from '@vality/ng-thrift';

@Pipe({
    name: 'toStatus',
    standalone: false,
})
export class ToStatusPipe implements PipeTransform {
    transform(status: Record<string, unknown>): string {
        return startCase(getUnionKey(status));
    }
}
