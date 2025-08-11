import { Component, OnInit, inject } from '@angular/core';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { DebounceTime, UpdateOptions } from '@vality/matez';
import { map } from 'rxjs/operators';

import { FetchFullDomainObjectsService } from '../../api/domain-config';

@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
    providers: [FetchFullDomainObjectsService],
    standalone: false,
})
export class ShopsComponent implements OnInit {
    private fetchDomainObjectsService = inject(FetchFullDomainObjectsService);

    shops$ = this.fetchDomainObjectsService.result$.pipe(
        map((objs) => objs.map((obj) => obj.object.shop_config)),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;

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

    reload(options: UpdateOptions) {
        this.fetchDomainObjectsService.reload(options);
    }

    more() {
        this.fetchDomainObjectsService.more();
    }
}
