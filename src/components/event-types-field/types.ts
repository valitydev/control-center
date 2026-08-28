export interface EventTypeTreeNode<T = unknown> {
    id: string;
    label: string;
    path: string[];
    eventType?: T;
    children?: EventTypeTreeNode<T>[];
    leaves: EventTypeTreeNode<T>[];
}
