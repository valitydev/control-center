import { map } from 'rxjs';

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { DebounceTime, DialogService, UpdateOptions } from '@vality/matez';

import { FetchFullDomainObjectsService } from '~/api/domain-config';
import { CreateShopDialogComponent } from '~/components/create-shop-dialog';

@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
    providers: [FetchFullDomainObjectsService],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ShopsComponent implements OnInit {
    private fetchDomainObjectsService = inject(FetchFullDomainObjectsService);
    private dialog = inject(DialogService);

    shops$ = this.fetchDomainObjectsService.result$.pipe(
        map((res) => res.map((r) => ({ ...r.object.shop_config, info: r.info }))),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;
    hasMore$ = this.fetchDomainObjectsService.hasMore$;

    ngOnInit() {
        this.searchParamsUpdated('');
    }

    @DebounceTime()
    searchParamsUpdated(search: string) {
        this.fetchDomainObjectsService.load({
            query: search.trim(),
            type: DomainObjectType.shop_config,
        });
    }

    reload(options?: UpdateOptions) {
        this.fetchDomainObjectsService.reload(options);
    }

    more() {
        this.fetchDomainObjectsService.more();
    }

    create() {
        this.dialog
            .open(CreateShopDialogComponent)
            .afterClosed()
            .subscribe((res) => {
                if (res?.status === 'success') {
                    this.reload();
                }
            });
    }
}
