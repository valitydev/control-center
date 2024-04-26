import { Component, Input, OnInit, booleanAttribute } from '@angular/core';
import { PayoutTool } from '@vality/domain-proto/domain';
import { PartyID, ShopID } from '@vality/domain-proto/payment_processing';
import {
    FormControlSuperclass,
    Option,
    createControlProviders,
    NotifyLogService,
    handleError,
} from '@vality/ng-core';
import { BehaviorSubject, combineLatest, defer, Observable, of, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

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
    @Input({ transform: booleanAttribute }) required: boolean;
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
                      .pipe(handleError(this.log.error, []))
                : of<PayoutTool[]>([]),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private partyManagementService: PartyManagementService,
        private log: NotifyLogService,
    ) {
        super();
    }
}
