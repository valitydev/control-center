import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ShopID } from '@vality/domain-proto/domain';
import { ThriftViewerModule } from '@vality/ng-thrift';
import { shareReplay, switchMap } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-shop-card',
    imports: [
        CommonModule,
        CardComponent,
        DomainThriftViewerComponent,
        ThriftViewerModule,
        MatTabGroup,
        MatTab,
    ],
    templateUrl: './shop-card.component.html',
})
export class ShopCardComponent {
    private partiesStoreService = inject(PartiesStoreService);
    id = input.required<ShopID>();

    progress$ = this.partiesStoreService.progress$;
    shop$ = toObservable(this.id).pipe(
        switchMap((id) => this.partiesStoreService.getShop(id)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    contractor$ = toObservable(this.id).pipe(
        switchMap((id) => this.partiesStoreService.getContractor(id)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    contract$ = toObservable(this.id).pipe(
        switchMap((id) => this.partiesStoreService.getContract(id)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
}
