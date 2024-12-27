import { CodegenClient } from '@vality/domain-proto/internal/payment_processing-Invoicing';
import { clean } from '@vality/matez';
import isNil from 'lodash-es/isNil';
import short from 'short-uuid';

import { CsvChargeback } from '../types/csv-chargeback';

export function getCreateChargebackArgs(
    c: CsvChargeback,
): Parameters<CodegenClient['CreateChargeback']> {
    return [
        c.invoice_id,
        c.payment_id,
        clean(
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
                    !isNil(c['body.amount']) && c['body.currency.symbolic_code']
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
                        extra: c['transaction_info.extra']
                            ? new Map(JSON.parse(c['transaction_info.extra']))
                            : undefined,
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
        ),
    ];
}
