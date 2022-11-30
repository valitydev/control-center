import { MatSort } from '@angular/material/sort';
import groupBy from 'lodash-es/groupBy';
import sortBy from 'lodash-es/sortBy';

import { getUnionValue } from '../../../../../../utils';
import { objectToJSON } from '../../../../../api/utils';
import { DataSourceItem } from '../types/data-source-item';

export function sortData(data: DataSourceItem[], sort: MatSort): DataSourceItem[] {
    switch (sort.active as keyof DataSourceItem) {
        case 'type':
            data = sortBy(data, 'type');
            break;
        case 'obj':
            data = sortBy(data, (o) => JSON.stringify(objectToJSON(o.obj)));
            break;
        case 'ref': {
            const groups = groupBy(data, (o) =>
                typeof getUnionValue(o.ref)?.['id'] === 'number' ? 0 : 1
            );

            data = [
                ...sortBy(groups[0], (o) => getUnionValue(o.ref)?.['id']),
                ...sortBy(groups[1], (o) => JSON.stringify(objectToJSON(getUnionValue(o.ref)))),
            ];
            break;
        }
    }
    if (sort.direction === 'desc') return data.reverse();
    return data;
}
