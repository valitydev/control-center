import { startCase } from 'lodash-es';
import set from 'lodash-es/set';

import { InvoiceEventType } from '@vality/domain-proto/webhooker';

import { EventTypeTreeNode } from '../types';

function parseNode(key: string, value: unknown, currentPath: string[]): EventTypeTreeNode {
    const isObject = typeof value === 'object' && value !== null;
    const keys = isObject ? Object.keys(value) : [];

    if (keys.length === 1 && (keys[0] === 'value' || keys[0] === 'status')) {
        const wrapperKey = keys[0];
        const innerValue = (value as Record<string, unknown>)[wrapperKey];
        const innerKeys =
            typeof innerValue === 'object' && innerValue !== null ? Object.keys(innerValue) : [];
        const children = innerKeys.map((k) =>
            parseNode(k, (innerValue as Record<string, unknown>)[k], [
                ...currentPath,
                wrapperKey,
                k,
            ]),
        );
        const leaves = children.flatMap((c) => c.leaves);
        return {
            id: currentPath.join('.'),
            label: startCase(key),
            path: currentPath,
            children,
            leaves,
        };
    }

    if (keys.length === 0) {
        const eventTypeObj = {};
        set(eventTypeObj, currentPath, {});
        const leafNode: EventTypeTreeNode = {
            id: currentPath.join('.'),
            label: startCase(key),
            path: currentPath,
            eventType: eventTypeObj as InvoiceEventType,
            leaves: [],
        };
        leafNode.leaves = [leafNode];
        return leafNode;
    }

    const children = keys.map((k) =>
        parseNode(k, (value as Record<string, unknown>)[k], [...currentPath, k]),
    );
    const leaves = children.flatMap((c) => c.leaves);
    return {
        id: currentPath.join('.'),
        label: startCase(key),
        path: currentPath,
        children,
        leaves,
    };
}

export function createEventTypesTree(
    eventTypesStructure: Record<string, unknown>,
): EventTypeTreeNode[] {
    return Object.keys(eventTypesStructure).map((key) =>
        parseNode(key, eventTypesStructure[key], [key]),
    );
}
