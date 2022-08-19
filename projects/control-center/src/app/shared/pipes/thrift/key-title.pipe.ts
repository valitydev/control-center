import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'keyTitle',
})
export class KeyTitlePipe implements PipeTransform {
    transform(value: unknown): string {
        return String(value).replaceAll('_', ' ');
    }
}
