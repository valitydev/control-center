import { inject } from '@angular/core';
import { DepositParams } from '@vality/fistful-proto/deposit';
import { clean } from '@vality/matez';
import { map } from 'rxjs/operators';

import { CsvDeposit } from '../types/csv-deposit';

import { AmountCurrencyService, UserInfoBasedIdGeneratorService } from '~/services';

export function getCreateDepositArgs(c: CsvDeposit) {
    const userInfoBasedIdGeneratorService = inject(UserInfoBasedIdGeneratorService);
    const amountCurrencyService = inject(AmountCurrencyService);
    return amountCurrencyService.toMinor(Number(c['body.amount']), c['body.currency']).pipe(
        map(
            (amount): DepositParams =>
                clean(
                    {
                        id: userInfoBasedIdGeneratorService.getUsernameBasedId(),
                        wallet_id: c.wallet_id,
                        source_id: c.source_id,
                        party_id: c.party_id,
                        body: {
                            amount,
                            currency: { symbolic_code: c['body.currency'] },
                        },
                        external_id: c.external_id,
                        metadata: c.metadata ? JSON.parse(c.metadata) : undefined,
                        description: c.description,
                    },
                    false,
                    true,
                ),
        ),
    );
}
