import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ngtKeyTitle',
    standalone: false
})
export class KeyTitlePipe implements PipeTransform {
    transform(value: unknown): string {
        return String(value).replaceAll('_', ' ');
    }
}
