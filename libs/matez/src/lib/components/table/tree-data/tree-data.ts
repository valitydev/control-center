export type TreeDataItem<T extends object, C extends object> = { value: T; children: C[] };
export type TreeData<T extends object, C extends object> = TreeDataItem<T, C>[];

export type TreeInlineDataItem<T extends object, C extends object> = { value?: T; child?: C };
export type TreeInlineData<T extends object, C extends object> = TreeInlineDataItem<T, C>[];
