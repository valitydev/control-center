import { Pipe, PipeTransform } from '@angular/core';

import { inlineJson } from '../utils';

@Pipe({
    name: 'inlineJson',
})
export class InlineJsonPipe implements PipeTransform {
    transform(value: unknown): unknown {
        return inlineJson(value);
    }
}
