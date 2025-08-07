import { Observable } from 'rxjs';

import { Nil } from '../../../utils';

export function loadFileContent(file: File | Nil, encoding = 'utf-8'): Observable<string> {
    return new Observable((subscriber) => {
        if (!file) {
            return undefined;
        }
        const read = new FileReader();
        read.readAsText(file, encoding);
        read.onloadend = function () {
            if (read.error) {
                return subscriber.error(read.error);
            } else {
                subscriber.next((read.result as string) || '');
            }
            subscriber.complete();
        };
    });
}
