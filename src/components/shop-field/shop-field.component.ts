import { Observable, combineLatest, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    booleanAttribute,
    inject,
    input,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { DomainObjectType, PartyConfigRef, ShopID } from '@vality/domain-proto/domain';
import {
    FormControlSuperclass,
    Option,
    SelectFieldComponent,
    createControlProviders,
} from '@vality/matez';

import { DomainObjectsStoreService, FetchDomainObjectsService } from '~/api/domain-config';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    providers: [...createControlProviders(() => ShopFieldComponent), FetchDomainObjectsService],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ShopFieldComponent extends FormControlSuperclass<ShopID | ShopID[]> {
    private fetchDomainObjectsService = inject(FetchDomainObjectsService);
    private domainObjectsStoreService = inject(DomainObjectsStoreService);

    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    multiple = input(false, { transform: booleanAttribute });
    partyId = input<PartyConfigRef['id']>();

    options$: Observable<Option<PartyConfigRef['id']>[]> = combineLatest([
        this.fetchDomainObjectsService.result$,
        toObservable(this.partyId).pipe(
            switchMap((partyId) =>
                partyId
                    ? this.domainObjectsStoreService.getObjects('shop_config').value$
                    : of(null),
            ),
        ),
    ]).pipe(
        map(([objects, partyShops]) => {
            const partyShopIds = partyShops
                ? new Set(
                      partyShops
                          .filter(
                              (shop) =>
                                  shop.object.shop_config.data.party_ref.id === this.partyId(),
                          )
                          .map((shop) => shop.object.shop_config.ref.id),
                  )
                : null;
            return objects
                .filter((object) => !partyShopIds || partyShopIds.has(object.ref.shop_config.id))
                .map((obj) => ({
                    value: obj.ref.shop_config.id,
                    label: obj.name || `#${obj.ref.shop_config.id}`,
                    description: obj.description,
                }));
        }),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;

    search(search: string) {
        this.fetchDomainObjectsService.load(
            { type: DomainObjectType.shop_config, query: search },
            { size: 1000 },
        );
    }
}
