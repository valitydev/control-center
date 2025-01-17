import { Pipe, PipeTransform } from '@angular/core';

import { inlineJson } from '../utils';

@Pipe({
    name: 'inlineJson',
    standalone: false,
})
export class InlineJsonPipe implements PipeTransform {
    transform(value: unknown, maxReadableLever: number | false = 1): string {
        return inlineJson(value, maxReadableLever === false ? Infinity : maxReadableLever);
    }
}
