import { InvoiceEventType } from '@vality/domain-proto/webhooker';

export interface EventTypeTreeNode {
    id: string;
    label: string;
    path: string[];
    eventType?: InvoiceEventType;
    children?: EventTypeTreeNode[];
    leaves: EventTypeTreeNode[];
}
