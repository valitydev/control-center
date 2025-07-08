import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UpdateOptions } from '@vality/matez';
import { map } from 'rxjs/operators';

import { FetchFullDomainObjectsService } from '../../api/domain-config';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [FetchFullDomainObjectsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class PartyShopsComponent {
    private fetchFullDomainObjectsService = inject(FetchFullDomainObjectsService);

    shops$ = this.fetchFullDomainObjectsService.result$.pipe(
        map((objs) => objs.map((obj) => obj.object.shop_config.data)),
    );
    progress$ = this.fetchFullDomainObjectsService.isLoading$;

    reload(options: UpdateOptions) {
        this.fetchFullDomainObjectsService.reload(options);
    }

    more() {
        this.fetchFullDomainObjectsService.more();
    }
}
