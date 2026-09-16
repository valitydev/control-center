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

import { DomainObjectType, PartyConfigRef, WalletID } from '@vality/domain-proto/domain';
import { Option, SelectFieldComponent, observableResource } from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

@Component({
    selector: 'cc-wallet-field',
    templateUrl: 'wallet-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class WalletFieldComponent implements FormValueControl<WalletID | WalletID[]> {
    private repositoryService = inject(ThriftRepositoryService);

    @Input() label: string;
    required = input(false, { transform: booleanAttribute });
    disabled = input(false);
    touch = output<void>();
    value = model<WalletID | WalletID[]>('');
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
