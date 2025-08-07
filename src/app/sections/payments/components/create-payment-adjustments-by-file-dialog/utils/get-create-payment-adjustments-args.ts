import { Invoicing } from '@vality/domain-proto/payment_processing';
import { clean } from '@vality/matez';

import { CsvPaymentAdjustment } from '../types/csv-payment-adjustment';

export function getCreatePaymentAdjustmentsArgs(
    c: CsvPaymentAdjustment,
): Parameters<Invoicing['CreatePaymentAdjustment']> {
    return [
        c.invoice_id,
        c.payment_id,
        clean(
            {
                reason: c.reason,
                scenario: clean(
                    {
                        status_change: c['scenario.status_change.target_status']
                            ? {
                                  target_status: {
                                      [c['scenario.status_change.target_status']]: c[
                                          'scenario.status_change.target_status.data'
                                      ]
                                          ? JSON.parse(
                                                c['scenario.status_change.target_status.data'],
                                            )
                                          : {},
                                  },
                              }
                            : undefined,
                        cash_flow: clean({
                            domain_revision: c['scenario.cash_flow.domain_revision']
                                ? Number(c['scenario.cash_flow.domain_revision'])
                                : undefined,
                            new_amount: c['scenario.cash_flow.new_amount']
                                ? Number(c['scenario.cash_flow.new_amount'])
                                : undefined,
                        }),
                    },
                    false,
                    true,
                ),
            },
            false,
            true,
        ),
    ];
}
