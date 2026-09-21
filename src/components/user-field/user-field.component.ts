import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    booleanAttribute,
    computed,
    inject,
    input,
    model,
    output,
} from '@angular/core';
import { FormField, FormValueControl, disabled, form, required } from '@angular/forms/signals';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { NotifyLogService, observableResource } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';

@Component({
    selector: 'cc-user-field',
    templateUrl: './user-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        FormField,
    ],
})
export class UserFieldComponent implements FormValueControl<string> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    label = input('User ID');
    required = input(false, { transform: booleanAttribute });
    disabled = model(false);
    value = model<string>('');

    touch = output<void>();
    userSelected = output<domain.User>();

    control = form(this.value, (schemaPath) => {
        required(schemaPath, { when: () => this.required() });
        disabled(schemaPath, () => this.disabled());
    });

    users = observableResource({
        loader: () =>
            this.thriftOrgManagementService
                .ListUsers({
                    limit: 100,
                })
                .pipe(
                    catchError((err) => {
                        this.log.error(err);
                        return of({ users: [] });
                    }),
                ),
        map: (res) => res.users || [],
    });

    filteredUsers = computed(() => {
        const query = (this.value() || '').toLowerCase().trim();
        const list = this.users.value() || [];
        if (!query) return list;
        return list.filter(
            (u) =>
                u.id.toLowerCase().includes(query) ||
                (u.email && u.email.toLowerCase().includes(query)),
        );
    });

    onOptionSelected(event: MatAutocompleteSelectedEvent): void {
        const selectedId = event.option.value;
        this.value.set(selectedId);
        const found = (this.users.value() || []).find((u) => u.id === selectedId);
        if (found) {
            this.userSelected.emit(found);
        }
    }

    clear(): void {
        this.value.set('');
    }
}
