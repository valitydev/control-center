import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    booleanAttribute,
    inject,
    input,
    model,
} from '@angular/core';
import { FormField, FormValueControl, form, required } from '@angular/forms/signals';

import {
    NotifyLogService,
    Option,
    SelectFieldComponent,
    SelectFieldModule,
    observableResource,
} from '@vality/matez';

import { ThriftOrganizationManagementService } from '~/api/services';

@Component({
    selector: 'cc-organization-field',
    templateUrl: './organization-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SelectFieldModule, FormField],
})
export class OrganizationFieldComponent implements FormValueControl<string> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    label = input('Organization');
    required = input(false, { transform: booleanAttribute });
    size = input<SelectFieldComponent['size']>();
    appearance = input<SelectFieldComponent['appearance']>();
    hint = input<string>();

    value = model<string>('');
    disabled = model(false);
    control = form(this.value, (schemaPath) => {
        required(schemaPath, { when: () => this.required() });
    });

    options = observableResource({
        loader: () =>
            this.thriftOrgManagementService.ListOrganizations({ limit: 100 }).pipe(
                catchError((err) => {
                    this.log.error(err);
                    return of({ organizations: [] });
                }),
            ),
        map: (res): Option<string>[] =>
            (res.organizations || []).map((org) => ({
                value: org.id,
                label: org.name || `#${org.id}`,
                description: org.id,
            })),
    });
}
