import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'keyTitle',
})
export class KeyTitlePipe implements PipeTransform {
    transform(value: string): string {
        return value.replaceAll('_', ' ');
    }
}
