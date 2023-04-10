import { formatDate } from '@angular/common';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import isObject from 'lodash-es/isObject';
import startCase from 'lodash-es/startCase';
import { Overwrite } from 'utility-types';

export type GridColumn<T> =
    | (Overwrite<
          MtxGridColumn,
          {
              formatter?: (rowData: T, colDef?: MtxGridColumn) => string;
          }
      > & {
          _data?: any;
      })
    | keyof T
    | string;

export function createGridColumn<T>(col: GridColumn<T>) {
    if (!isObject(col))
        col = {
            field: col as string,
        };
    if (!col.header) col.header = startCase(String(col.field).toLowerCase());
    return {
        ...col,
    };
}

export function createGridColumns<T>(columns: GridColumn<T>[]): MtxGridColumn[] {
    return columns.map((col) => createGridColumn(col));
}

export function createDescriptionFormattedColumn<T>(
    field: string,
    getDescriptionOrDescriptionField: ((data: T) => string) | string,
    getValue?: (data: T) => string
): MtxGridColumn {
    return {
        field,
        formatter: (data: T) => {
            const desc =
                typeof getDescriptionOrDescriptionField === 'function'
                    ? getDescriptionOrDescriptionField(data)
                    : String(data[getDescriptionOrDescriptionField]);
            const value = getValue ? getValue(data) : String(data[field]);
            return value + (desc ? `<div class="mat-caption cc-secondary-text">${desc}</div>` : '');
        },
    };
}

export function createDatetimeFormattedColumn<T>(field: string): MtxGridColumn {
    return {
        field,
        formatter: (data: T) => formatDate(data[field], 'dd.MM.yyyy HH:mm:ss', 'en'),
    };
}
