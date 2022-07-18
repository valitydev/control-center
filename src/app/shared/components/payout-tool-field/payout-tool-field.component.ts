import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { PartyID, PayoutTool, ShopID } from '@vality/domain-proto';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, combineLatest, defer, Observable, of, Subject, switchMap } from 'rxjs';
import { catchError, map, pluck, shareReplay, startWith } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { NotificationService } from '@cc/app/shared/services/notification';
import { Option } from '@cc/components/select-search-field';
import { createControlProviders, ValidatedFormGroupSuperclass } from '@cc/utils/forms';

@UntilDestroy()
@Component({
    selector: 'cc-payout-tool-field',
    templateUrl: 'payout-tool-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: createControlProviders(PayoutToolFieldComponent),
})
export class PayoutToolFieldComponent
    extends ValidatedFormGroupSuperclass<PartyID>
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

    control = new FormControl<PartyID>();

    partyId$ = new BehaviorSubject<PartyID>(null);
    shopId$ = new BehaviorSubject<ShopID>(null);

    searchChange$ = new Subject<string>();
    options$: Observable<Option<PayoutTool['id']>[]> = combineLatest([
        this.searchChange$.pipe(map((str) => str?.trim()?.toLowerCase())).pipe(startWith('')),
        defer(() => this.payoutTools$),
    ]).pipe(
        map(([str, payoutTools]) => payoutTools.filter((t) => t.id.includes(str))),
        map((payoutTools) => payoutTools.map((t) => ({ label: t.id, value: t.id }))),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    private payoutTools$ = combineLatest([this.partyId$, this.shopId$]).pipe(
        switchMap(([partyId, shopId]) =>
            partyId && shopId
                ? this.partyManagementWithUserService
                      .getShop(partyId, shopId)
                      .pipe(
                          switchMap(({ contract_id }) =>
                              this.partyManagementWithUserService.getContract(partyId, contract_id)
                          ),
                          pluck('payout_tools')
                      )
                      .pipe(
                          catchError((err) => {
                              this.notificationService.error('Error when getting shop or contract');
                              console.error(err);
                              return of<PayoutTool[]>([]);
                          })
                      )
                : of<PayoutTool[]>([])
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(
        injector: Injector,
        private partyManagementWithUserService: PartyManagementWithUserService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }
}
