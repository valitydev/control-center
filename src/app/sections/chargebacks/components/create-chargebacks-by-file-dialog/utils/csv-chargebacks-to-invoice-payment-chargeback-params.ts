import { InvoicePaymentChargebackParams } from '@vality/domain-proto/payment_processing';
import { clean } from '@vality/ng-core';
import short from 'short-uuid';

import { CsvChargeback } from '../types/csv-chargeback';

export function csvChargebacksToInvoicePaymentChargebackParams(
    c: CsvChargeback,
): InvoicePaymentChargebackParams {
    return clean(
        {
            id: short().generate(),
            reason: {
                code: c['reason.code'],
                category: { [c['reason.category']]: {} },
            },
            levy: {
                amount: Number(c['levy.amount']),
                currency: {
                    symbolic_code: c['levy.currency.symbolic_code'],
                },
            },
            body:
                (c['body.amount'] || typeof c['body.amount'] === 'number') &&
                c['body.currency.symbolic_code']
                    ? {
                          amount: Number(c['body.amount']),
                          currency: {
                              symbolic_code: c['body.currency.symbolic_code'],
                          },
                      }
                    : undefined,
            transaction_info: clean(
                {
                    id: c['transaction_info.id'],
                    timestamp: c['transaction_info.timestamp'],
                    extra: c['transaction_info.extra'],
                    additional_info: c['transaction_info.additional_info']
                        ? JSON.parse(c['transaction_info.additional_info'])
                        : undefined,
                },
                true,
            ),
            external_id: c.external_id,
            context: clean(
                {
                    type: c['context.type'],
                    data: c['context.data'],
                },
                true,
            ),
            occurred_at: c['occurred_at'],
        },
        false,
        true,
    );
}
