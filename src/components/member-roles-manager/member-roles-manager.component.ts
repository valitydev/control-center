import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    output,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { NotifyLogService, Option, observableResource } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftRepositoryService } from '~/api/services';

import { MemberRolePanelComponent } from './member-role-panel/member-role-panel.component';
import { groupMemberRoles } from './utils/group-member-roles';

@Component({
    selector: 'cc-member-roles-manager',
    templateUrl: './member-roles-manager.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatExpansionModule, MemberRolePanelComponent],
})
export class MemberRolesManagerComponent {
    private repositoryService = inject(ThriftRepositoryService);
    private log = inject(NotifyLogService);

    roles = input.required<(domain.MemberRole | domain.RoleAssignment)[]>();
    partyId = input<domain.PartyID>();
    disabled = input(false);
    readonly = input(false);

    expandedRole = model<string | null>(null);

    assign = output<domain.RoleAssignment>();
    remove = output<domain.MemberRole>();

    normalizedRoles = computed<domain.MemberRole[]>(() =>
        this.roles().map((r, index) => ({
            id: (r as domain.MemberRole).id || `role-${index}-${r.role_id}`,
            role_id: r.role_id,
            ...(r.scope ? { scope: r.scope } : {}),
        })),
    );

    groups = computed(() => groupMemberRoles(this.normalizedRoles()));

    shops = observableResource<Option<string>[], domain.PartyID | undefined>({
        params: this.partyId,
        loader: (partyId) => this.loadResources(partyId, DomainObjectType.shop_config),
    });
    wallets = observableResource<Option<string>[], domain.PartyID | undefined>({
        params: this.partyId,
        loader: (partyId) => this.loadResources(partyId, DomainObjectType.wallet_config),
    });

    private loadResources(
        partyId: domain.PartyID | undefined,
        type: DomainObjectType.shop_config | DomainObjectType.wallet_config,
    ) {
        if (!partyId) {
            return of<Option<string>[]>([]);
        }
        return this.repositoryService
            .GetRelatedGraph({ ref: { party_config: { id: partyId } }, type })
            .pipe(
                map(({ nodes }): Option<string>[] =>
                    Array.from(nodes, (node) => ({
                        value:
                            type === DomainObjectType.shop_config
                                ? node.ref.shop_config.id
                                : node.ref.wallet_config.id,
                        label: node.name,
                        description: node.description,
                    })),
                ),
                map((options) =>
                    options.map((option) => ({ ...option, label: option.label || option.value })),
                ),
                catchError((err) => {
                    this.log.error(err);
                    return of<Option<string>[]>([]);
                }),
            );
    }
}
