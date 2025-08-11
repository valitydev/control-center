import { Component, Input, booleanAttribute, inject, input } from '@angular/core';
import { DomainObjectType, PartyID } from '@vality/domain-proto/domain';
import { ShopID } from '@vality/domain-proto/payment_processing';
import {
    FormControlSuperclass,
    Option,
    SelectFieldComponent,
    createControlProviders,
} from '@vality/matez';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FetchDomainObjectsService } from '~/api/domain-config';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    providers: [...createControlProviders(() => ShopFieldComponent), FetchDomainObjectsService],
    standalone: false,
})
export class ShopFieldComponent extends FormControlSuperclass<ShopID | ShopID[]> {
    private fetchDomainObjectsService = inject(FetchDomainObjectsService);

    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    multiple = input(false, { transform: booleanAttribute });

    options$: Observable<Option<PartyID>[]> = this.fetchDomainObjectsService.result$.pipe(
        map((objs) =>
            objs.map((obj) => ({
                value: obj.ref.shop_config.id,
                label: obj.name || `#${obj.ref.shop_config.id}`,
                description: obj.description,
            })),
        ),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;

    search(search: string) {
        this.fetchDomainObjectsService.load(
            { type: DomainObjectType.shop_config, query: search },
            { size: 1000 },
        );
    }
}
