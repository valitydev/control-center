import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { PayoutTool } from '@vality/domain-proto/domain';
import { PartyID, ShopID } from '@vality/domain-proto/payment_processing';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, combineLatest, defer, Observable, of, Subject, switchMap } from 'rxjs';
import { map, pluck, shareReplay, startWith } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { Option } from '@cc/components/select-search-field';
import { createControlProviders, ValidatedControlSuperclass } from '@cc/utils/forms';

import { handleError, NotificationErrorService } from '../../services/notification-error';

@UntilDestroy()
@Component({
    selector: 'cc-payout-tool-field',
    templateUrl: 'payout-tool-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: createControlProviders(() => PayoutToolFieldComponent),
})
export class PayoutToolFieldComponent
    extends ValidatedControlSuperclass<PartyID>
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

    control = new FormControl() as FormControl<PartyID>;

    partyId$ = new BehaviorSubject<PartyID>(null);
    shopId$ = new BehaviorSubject<ShopID>(null);

    searchChange$ = new Subject<string>();
    options$: Observable<Option<PayoutTool['id']>[]> = combineLatest([
        this.searchChange$.pipe(map((str) => str?.trim()?.toLowerCase())).pipe(startWith('')),
        defer(() => this.payoutTools$),
    ]).pipe(
        map(([str, payoutTools]) => payoutTools.filter((t) => t.id.includes(str))),
        map((payoutTools) => payoutTools.map((t) => ({ label: t.id, value: t.id }))),
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
                          pluck('payout_tools'),
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
