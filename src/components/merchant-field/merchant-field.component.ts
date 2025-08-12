import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Component, Input, booleanAttribute, inject } from '@angular/core';

import { DomainObjectType, PartyID } from '@vality/domain-proto/domain';
import {
    FormControlSuperclass,
    Option,
    SelectFieldComponent,
    createControlProviders,
} from '@vality/matez';

import { FetchDomainObjectsService } from '~/api/domain-config';

@Component({
    selector: 'cc-merchant-field',
    templateUrl: 'merchant-field.component.html',
    providers: [...createControlProviders(() => MerchantFieldComponent), FetchDomainObjectsService],
    standalone: false,
})
export class MerchantFieldComponent extends FormControlSuperclass<PartyID> {
    private fetchDomainObjectsService = inject(FetchDomainObjectsService);

    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;

    options$: Observable<Option<PartyID>[]> = this.fetchDomainObjectsService.result$.pipe(
        map((objs) =>
            objs.map((obj) => ({
                value: obj.ref.party_config.id,
                label: obj.name || `#${obj.ref.party_config.id}`,
                description: obj.description,
            })),
        ),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;

    search(search: string) {
        this.fetchDomainObjectsService.load(
            { type: DomainObjectType.party_config, query: search },
            { size: 1000 },
        );
    }
}
