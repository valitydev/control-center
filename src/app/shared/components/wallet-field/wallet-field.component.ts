import { Component, Input, booleanAttribute, inject } from '@angular/core';
import { DomainObjectType, WalletID } from '@vality/domain-proto/domain';
import {
    FormControlSuperclass,
    Option,
    SelectFieldComponent,
    createControlProviders,
} from '@vality/matez';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FetchDomainObjectsService } from '../../../../api/domain-config';

@Component({
    selector: 'cc-wallet-field',
    templateUrl: 'wallet-field.component.html',
    providers: [...createControlProviders(() => WalletFieldComponent), FetchDomainObjectsService],
    standalone: false,
})
export class WalletFieldComponent extends FormControlSuperclass<WalletID | WalletID[]> {
    private fetchDomainObjectsService = inject(FetchDomainObjectsService);

    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    @Input({ transform: booleanAttribute }) multiple = false;

    options$: Observable<Option<WalletID>[]> = this.fetchDomainObjectsService.result$.pipe(
        map((objs) =>
            objs.map((obj) => ({
                value: obj.ref.wallet_config.id,
                label: obj.name || `#${obj.ref.wallet_config.id}`,
                description: obj.description,
            })),
        ),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;

    search(search: string) {
        this.fetchDomainObjectsService.load(
            { type: DomainObjectType.wallet_config, query: search },
            { size: 1000 },
        );
    }
}
