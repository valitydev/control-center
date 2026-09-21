import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    booleanAttribute,
    inject,
    input,
    model,
    output,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormValueControl, disabled, form, required } from '@angular/forms/signals';

import { DomainObjectType, PartyConfigRef, ShopID } from '@vality/domain-proto/domain';
import { Option, SelectFieldComponent, observableResource } from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ShopFieldComponent implements FormValueControl<ShopID | ShopID[]> {
    private repositoryService = inject(ThriftRepositoryService);

    @Input() label: string;
    required = input(false, { transform: booleanAttribute });
    disabled = input(false);
    touch = output<void>();
    value = model<ShopID | ShopID[]>('');
    control = form(this.value, (path) => {
        required(path, { when: () => this.required() });
        disabled(path, () => this.disabled());
    });
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    @Input() placeholder?: string;
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
