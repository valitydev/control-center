import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { InputFieldModule } from '@vality/matez';

import { MerchantFieldModule } from '~/components/merchant-field';
import { UserFieldComponent } from '~/components/user-field';

import { AllowedIpsFieldComponent } from '../allowed-ips-field/allowed-ips-field.component';

export interface OrganizationFormValue {
    name: string;
    party_id: string;
    owner_id: string;
    metadata: string;
    allowed_ips: string[];
}

@Component({
    selector: 'cc-organization-form',
    imports: [
        FormField,
        InputFieldModule,
        MerchantFieldModule,
        UserFieldComponent,
        AllowedIpsFieldComponent,
    ],
    templateUrl: './organization-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFormComponent {
    control = input.required<FieldTree<OrganizationFormValue>>();
    create = input(false);
    fixedParty = input(false);
}
