import { inject } from '@angular/core';
import { CodegenClient } from '@vality/fistful-proto/internal/deposit-Management';
import { clean } from '@vality/ng-core';

import { UserInfoBasedIdGeneratorService } from '../../../../../shared/services';
import { CsvDeposit } from '../types/csv-deposit';

export function getCreateDepositArgs(c: CsvDeposit): Parameters<CodegenClient['Create']> {
    const userInfoBasedIdGeneratorService = inject(UserInfoBasedIdGeneratorService);
    return [
        clean(
            {
                id: userInfoBasedIdGeneratorService.getUsernameBasedId(),
                wallet_id: c.wallet_id,
                source_id: c.source_id,
                body: {
                    amount: Number(c['body.amount']),
                    currency: { symbolic_code: c['body.currency'] },
                },
                external_id: c.external_id,
                metadata: c.metadata ? JSON.parse(c.metadata) : undefined,
                description: c.description,
            },
            false,
            true,
        ),
        new Map(),
    ];
}
