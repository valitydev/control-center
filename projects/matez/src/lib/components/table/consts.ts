import { Sort } from '@angular/material/sort';

import { createUniqueColumnDef } from './utils/create-unique-column-def';

export const DEFAULT_SORT: Sort = { active: '', direction: '' };
export const DEBOUNCE_TIME_MS = 500;
export const DEFAULT_LOADED_LAZY_ROWS_COUNT = 3;
export const COLUMN_DEFS = {
    select: createUniqueColumnDef('select'),
    drag: createUniqueColumnDef('drag'),
};
