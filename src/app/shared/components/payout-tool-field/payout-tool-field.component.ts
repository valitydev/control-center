import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { PayoutTool } from '@vality/domain-proto/domain';
import { PartyID, ShopID } from '@vality/domain-proto/payment_processing';
import { createControlProviders, FormControlSuperclass, Option } from '@vality/ng-core';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, combineLatest, defer, Observable, of, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

import { handleError, NotificationErrorService } from '../../services/notification-error';

@UntilDestroy()
@Component({
    selector: 'cc-payout-tool-field',
    templateUrl: 'payout-tool-field.component.html',
    providers: createControlProviders(() => PayoutToolFieldComponent),
})
export class PayoutToolFieldComponent
    extends FormControlSuperclass<PayoutTool['id']>
    implements OnInit
{
    @Input() label: string;
    @Input() @coerceBoolean required: boolean;
    @Input() set partyId(partyId: PartyID) {
        this.partyId$.next(partyId);
    }
    @Input() set shopId(shopId: ShopID) {
        this.shopId$.next(shopId);
    }

    partyId$ = new BehaviorSubject<PartyID>(null);
    shopId$ = new BehaviorSubject<ShopID>(null);
    options$: Observable<Option<PayoutTool['id']>[]> = defer(() => this.payoutTools$).pipe(
        map((payoutTools) =>
            payoutTools.map((t) => ({ label: t.id, value: t.id, description: t.id })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private payoutTools$ = combineLatest([this.partyId$, this.shopId$]).pipe(
        switchMap(([partyId, shopId]) =>
            partyId && shopId
                ? this.partyManagementService
                      .GetShop(partyId, shopId)
                      .pipe(
                          switchMap(({ contract_id }) =>
                              this.partyManagementService.GetContract(partyId, contract_id),
                          ),
                          map((contract) => contract.payout_tools),
                      )
                      .pipe(
                          handleError(
                              this.notificationErrorService.error,
                              null,
                              of<PayoutTool[]>([]),
                          ),
                      )
                : of<PayoutTool[]>([]),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private partyManagementService: PartyManagementService,
        private notificationErrorService: NotificationErrorService,
    ) {
        super();
    }
}
