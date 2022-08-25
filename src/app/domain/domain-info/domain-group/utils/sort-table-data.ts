import { MatSort } from '@angular/material/sort';
import sortBy from 'lodash-es/sortBy';

import { objectToJSON } from '../../../../api/utils';
import { DataSourceItem } from '../types/data-source-item';

export function sortData(data: DataSourceItem[], sort: MatSort): DataSourceItem[] {
    switch (sort.active as keyof DataSourceItem) {
        case 'type':
            data = sortBy(data, 'type');
            break;
        case 'obj':
            data = sortBy(data, [(o) => JSON.stringify(objectToJSON(o.obj))]);
            break;
        case 'ref':
            data = sortBy(data, [
                (o) => {
                    const id = o.ref?.['id'];
                    if (typeof id === 'number') return id;
                    return JSON.stringify(objectToJSON(o.ref));
                },
            ]);
            break;
    }
    if (sort.direction === 'desc') return data.reverse();
    return data;
}
