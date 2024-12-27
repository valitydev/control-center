import { MenuValue } from '../../value/components/menu-value.component';
// TODO: hack
// eslint-disable-next-line
import { Column } from '../types/column2';
import { createColumn } from '../utils/create-column';

export const createMenuColumn = createColumn(
    (params: MenuValue['params']) => {
        return {
            type: 'menu',
            params,
        };
    },
    {
        field: 'menu',
        header: '',
        sticky: 'end',
        style: {
            padding: 0,
            width: '0',
        },
    },
);
