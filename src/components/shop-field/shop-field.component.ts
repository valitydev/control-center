import { of } from 'rxjs';
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
    observableResource,
} from '@vality/matez';

import { FetchDomainObjectsService } from '~/api/domain-config';
import { ThriftRepositoryService } from '~/api/services';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    providers: [...createControlProviders(() => ShopFieldComponent), FetchDomainObjectsService],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ShopFieldComponent extends FormControlSuperclass<ShopID | ShopID[]> {
    private repositoryService = inject(ThriftRepositoryService);

    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    multiple = input(false, { transform: booleanAttribute });
    partyId = input<PartyConfigRef['id']>();

    shops = observableResource({
        params: toObservable(this.partyId).pipe(map((partyId) => ({ partyId, query: '' }))),
        loader: ({ partyId, query }) =>
            !partyId && !query
                ? of([])
                : (partyId
                      ? this.repositoryService
                            .GetRelatedGraph({
                                ref: { party_config: { id: partyId } },
                                type: DomainObjectType.shop_config,
                            })
                            .pipe(map(({ nodes }) => Array.from(nodes)))
                      : this.repositoryService
                            .SearchObjects({
                                type: DomainObjectType.shop_config,
                                query: query || '*',
                                limit: 1000,
                            })
                            .pipe(map((res) => res.result || []))
                  ).pipe(
                      map((objs): Option<PartyConfigRef['id']>[] =>
                          objs.map((obj) => ({
                              value: obj.ref.shop_config.id,
                              label: obj.name || `#${obj.ref.shop_config.id}`,
                              description: obj.description,
                          })),
                      ),
                  ),
    });
}
