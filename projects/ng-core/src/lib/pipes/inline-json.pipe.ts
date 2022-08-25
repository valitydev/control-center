import { Pipe, PipeTransform } from '@angular/core';

import { inlineJson } from '../utils';

@Pipe({
    name: 'inlineJson',
})
export class InlineJsonPipe implements PipeTransform {
    transform(value: unknown, maxReadableLever: number | false = 1): unknown {
        return inlineJson(value, maxReadableLever === false ? Infinity : maxReadableLever);
    }
}
