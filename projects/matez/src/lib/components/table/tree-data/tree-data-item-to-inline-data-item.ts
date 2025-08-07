import { TreeDataItem } from './tree-data';

export function treeDataItemToInlineDataItem<T extends object, C extends object>(
    item: TreeDataItem<T, C>,
) {
    const children = item.children ?? [];
    return [
        children.length ? { value: item.value, child: children[0] } : { value: item.value },
        ...children.slice(1).map((child) => ({ child })),
    ];
}
