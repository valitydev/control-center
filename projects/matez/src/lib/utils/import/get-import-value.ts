import { get } from 'lodash-es';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export function getImportValue<T>(imp: Promise<unknown>, prop: string = 'default'): Observable<T> {
    return from(imp).pipe(
        map((module) => {
            if (!prop) {
                return module as T;
            }
            return get(module, prop, null) as T;
        }),
    );
}
