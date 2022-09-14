import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BaseDialogService, BaseDialogResponseStatus } from '@vality/ng-core';
import { combineLatest, switchMap } from 'rxjs';
import { pluck, filter, withLatestFrom, first } from 'rxjs/operators';

import { ConfirmActionDialogComponent } from '../../../components/confirm-action-dialog';
import { getUnionKey } from '../../../utils';
import { PartyManagementService } from '../../api/payment-processing';
import { ErrorService } from '../../shared/services/error';
import { NotificationService } from '../../shared/services/notification';
import { FetchShopService } from './services/fetch-shop.service';

@UntilDestroy()
@Component({
    templateUrl: 'shop-details.component.html',
    providers: [FetchShopService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopDetailsComponent {
    partyID$ = this.route.params.pipe(pluck('partyID'));
    shopID$ = this.route.params.pipe(pluck('shopID'));

    shop$ = this.fetchShopService.shop$;
    inProgress$ = this.fetchShopService.inProgress$;

    constructor(
        private fetchShopService: FetchShopService,
        private route: ActivatedRoute,
        private partyManagementService: PartyManagementService,
        private baseDialogService: BaseDialogService,
        private errorService: ErrorService,
        private notificationService: NotificationService
    ) {
        combineLatest([this.partyID$, this.shopID$]).subscribe(([partyID, shopID]) => {
            this.fetchShopService.getShop(partyID, shopID);
        });
    }

    toggleBlocking() {
        this.shop$
            .pipe(
                first(),
                switchMap((shop) =>
                    this.baseDialogService
                        .open(ConfirmActionDialogComponent, {
                            title:
                                getUnionKey(shop.blocking) === 'unblocked'
                                    ? 'Block shop'
                                    : 'Unblock shop',
                            hasReason: true,
                        })
                        .afterClosed()
                ),
                filter((r) => r.status === BaseDialogResponseStatus.Success),
                withLatestFrom(this.shop$, this.partyID$),
                switchMap(([{ data }, shop, partyID]) =>
                    getUnionKey(shop.blocking) === 'unblocked'
                        ? this.partyManagementService.BlockShop(partyID, shop.id, data.reason)
                        : this.partyManagementService.UnblockShop(partyID, shop.id, data.reason)
                )
            )
            .subscribe({
                next: () => {
                    this.fetchShopService.reload();
                    this.notificationService.success();
                },
                error: (err) => {
                    this.errorService.error(err);
                },
            });
    }

    toggleSuspension() {
        this.shop$
            .pipe(
                first(),
                switchMap((shop) =>
                    this.baseDialogService
                        .open(ConfirmActionDialogComponent, {
                            title:
                                getUnionKey(shop.suspension) === 'active'
                                    ? 'Suspend shop'
                                    : 'Activate shop',
                        })
                        .afterClosed()
                ),
                filter((r) => r.status === BaseDialogResponseStatus.Success),
                withLatestFrom(this.shop$, this.partyID$),
                switchMap(([, shop, partyID]) =>
                    getUnionKey(shop.suspension) === 'active'
                        ? this.partyManagementService.SuspendShop(partyID, shop.id)
                        : this.partyManagementService.ActivateShop(partyID, shop.id)
                )
            )
            .subscribe({
                next: () => {
                    this.fetchShopService.reload();
                    this.notificationService.success();
                },
                error: (err) => {
                    this.errorService.error(err);
                },
            });
    }
}
