import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { DialogService, DialogResponseStatus, ConfirmDialogComponent } from '@vality/ng-core';
import { combineLatest, switchMap, from } from 'rxjs';
import { pluck, filter, withLatestFrom, first, map } from 'rxjs/operators';

import { DomainMetadataViewExtensionsService } from '@cc/app/shared/services/domain-metadata-view-extensions';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { getUnionKey } from '../../../utils';
import { PartyManagementService } from '../../api/payment-processing';
import { NotificationService } from '../../shared/services/notification';

import { FetchShopService } from './services/fetch-shop.service';

@UntilDestroy()
@Component({
    templateUrl: 'shop-details.component.html',
    providers: [FetchShopService],
})
export class ShopDetailsComponent {
    partyID$ = this.route.params.pipe(pluck('partyID'));
    shopID$ = this.route.params.pipe(pluck('shopID'));

    shop$ = this.fetchShopService.shop$;
    contract$ = this.fetchShopService.contract$.pipe(map((c) => c?.contract));
    inProgress$ = this.fetchShopService.inProgress$;
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataViewExtensionsService.extensions$;

    constructor(
        private fetchShopService: FetchShopService,
        private route: ActivatedRoute,
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private notificationErrorService: NotificationErrorService,
        private notificationService: NotificationService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService
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
                    this.dialogService
                        .open(ConfirmDialogComponent, {
                            title:
                                getUnionKey(shop.blocking) === 'unblocked'
                                    ? 'Block shop'
                                    : 'Unblock shop',
                            hasReason: true,
                        })
                        .afterClosed()
                ),
                filter((r) => r.status === DialogResponseStatus.Success),
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
                    this.notificationErrorService.error(err);
                },
            });
    }

    toggleSuspension() {
        this.shop$
            .pipe(
                first(),
                switchMap((shop) =>
                    this.dialogService
                        .open(ConfirmDialogComponent, {
                            title:
                                getUnionKey(shop.suspension) === 'active'
                                    ? 'Suspend shop'
                                    : 'Activate shop',
                        })
                        .afterClosed()
                ),
                filter((r) => r.status === DialogResponseStatus.Success),
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
                    this.notificationErrorService.error(err);
                },
            });
    }
}
