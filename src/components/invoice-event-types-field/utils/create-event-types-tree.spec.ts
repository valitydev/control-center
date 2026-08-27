import { InvoiceEventType } from '@vality/domain-proto/webhooker';

import { createEventTypesTree } from './create-event-types-tree';

const TEST_INVOICE_EVENT_TYPES: InvoiceEventType = {
    created: {},
    status_changed: {
        value: {
            unpaid: {},
            paid: {},
            cancelled: {},
            fulfilled: {},
        },
    },
    payment: {
        created: {},
        status_changed: {
            value: {
                pending: {},
                processed: {},
                captured: {},
                cancelled: {},
                failed: {},
                refunded: {},
            },
        },
        invoice_payment_refund_change: {
            invoice_payment_refund_created: {},
            invoice_payment_refund_status_changed: {
                value: {
                    pending: {},
                    succeeded: {},
                    failed: {},
                },
            },
        },
        user_interaction: {
            status: {
                requested: {},
                completed: {},
            },
        },
    },
};

describe('createEventTypesTree', () => {
    it('returns empty array for empty object', () => {
        expect(createEventTypesTree({})).toEqual([]);
    });

    it('creates single leaf node correctly', () => {
        const tree = createEventTypesTree({ created: {} });

        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe('created');
        expect(tree[0].label).toBe('Created');
        expect(tree[0].path).toEqual(['created']);
        expect(tree[0].eventType).toEqual({ created: {} });
        expect(tree[0].leaves).toHaveLength(1);
        expect(tree[0].leaves[0]).toBe(tree[0]);
    });

    it('collapses "value" wrapper key and preserves eventType structure', () => {
        const tree = createEventTypesTree({
            status_changed: {
                value: {
                    unpaid: {},
                    paid: {},
                },
            },
        });

        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe('status_changed');
        expect(tree[0].label).toBe('Status Changed');
        expect(tree[0].children).toHaveLength(2);
        expect(tree[0].children?.[0].label).toBe('Unpaid');
        expect(tree[0].children?.[0].path).toEqual(['status_changed', 'value', 'unpaid']);
        expect(tree[0].children?.[0].eventType).toEqual({
            status_changed: { value: { unpaid: {} } },
        });
        expect(tree[0].children?.[1].label).toBe('Paid');
        expect(tree[0].children?.[1].path).toEqual(['status_changed', 'value', 'paid']);
        expect(tree[0].children?.[1].eventType).toEqual({
            status_changed: { value: { paid: {} } },
        });
        expect(tree[0].leaves).toHaveLength(2);
    });

    it('collapses "status" wrapper key and preserves eventType structure', () => {
        const tree = createEventTypesTree({
            user_interaction: {
                status: {
                    requested: {},
                    completed: {},
                },
            },
        });

        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe('user_interaction');
        expect(tree[0].label).toBe('User Interaction');
        expect(tree[0].children).toHaveLength(2);
        expect(tree[0].children?.[0].label).toBe('Requested');
        expect(tree[0].children?.[0].eventType).toEqual({
            user_interaction: { status: { requested: {} } },
        });
        expect(tree[0].children?.[1].label).toBe('Completed');
        expect(tree[0].children?.[1].eventType).toEqual({
            user_interaction: { status: { completed: {} } },
        });
        expect(tree[0].leaves).toHaveLength(2);
    });

    it('correctly creates full tree for TEST_INVOICE_EVENT_TYPES', () => {
        const tree = createEventTypesTree(TEST_INVOICE_EVENT_TYPES as Record<string, unknown>);

        expect(tree).toHaveLength(3);
        expect(tree.map((node) => node.label)).toEqual(['Created', 'Status Changed', 'Payment']);

        const allLeaves = tree.flatMap((node) => node.leaves);
        expect(allLeaves).toHaveLength(18);

        const createdNode = tree.find((n) => n.id === 'created');
        expect(createdNode?.leaves).toHaveLength(1);

        const statusChangedNode = tree.find((n) => n.id === 'status_changed');
        expect(statusChangedNode?.leaves).toHaveLength(4);

        const paymentNode = tree.find((n) => n.id === 'payment');
        expect(paymentNode?.leaves).toHaveLength(13);

        const refundCreatedLeaf = allLeaves.find(
            (leaf) =>
                leaf.id === 'payment.invoice_payment_refund_change.invoice_payment_refund_created',
        );
        expect(refundCreatedLeaf?.eventType).toEqual({
            payment: {
                invoice_payment_refund_change: {
                    invoice_payment_refund_created: {},
                },
            },
        });

        const refundStatusPendingLeaf = allLeaves.find(
            (leaf) =>
                leaf.id ===
                'payment.invoice_payment_refund_change.invoice_payment_refund_status_changed.value.pending',
        );
        expect(refundStatusPendingLeaf?.eventType).toEqual({
            payment: {
                invoice_payment_refund_change: {
                    invoice_payment_refund_status_changed: {
                        value: {
                            pending: {},
                        },
                    },
                },
            },
        });
    });
});
