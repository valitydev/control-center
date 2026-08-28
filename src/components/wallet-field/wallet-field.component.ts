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

import { DomainObjectType, PartyConfigRef, WalletID } from '@vality/domain-proto/domain';
import {
    FormControlSuperclass,
    Option,
    SelectFieldComponent,
    createControlProviders,
    observableResource,
} from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

@Component({
    selector: 'cc-wallet-field',
    templateUrl: 'wallet-field.component.html',
    providers: [...createControlProviders(() => WalletFieldComponent)],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class WalletFieldComponent extends FormControlSuperclass<WalletID | WalletID[]> {
    private repositoryService = inject(ThriftRepositoryService);

    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    multiple = input(false, { transform: booleanAttribute });
    partyId = input<PartyConfigRef['id']>();

    wallets = observableResource({
        params: toObservable(this.partyId).pipe(map((partyId) => ({ partyId, query: '' }))),
        loader: ({ partyId, query }) =>
            !partyId && !query
                ? of([])
                : (partyId
                      ? this.repositoryService
                            .GetRelatedGraph({
                                ref: { party_config: { id: partyId } },
                                type: DomainObjectType.wallet_config,
                            })
                            .pipe(map(({ nodes }) => Array.from(nodes)))
                      : this.repositoryService
                            .SearchObjects({
                                type: DomainObjectType.wallet_config,
                                query: query || '*',
                                limit: 1000,
                            })
                            .pipe(map((res) => res.result || []))
                  ).pipe(
                      map((objs): Option<PartyConfigRef['id']>[] =>
                          objs.map((obj) => ({
                              value: obj.ref.wallet_config.id,
                              label: obj.name || `#${obj.ref.wallet_config.id}`,
                              description: obj.description,
                          })),
                      ),
                  ),
    });
}
