import { of } from 'rxjs';

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DialogResponseStatus, DialogService, NotifyLogService } from '@vality/matez';

import { ThriftOrganizationManagementService } from '~/api/services';

import { PartyStoreService } from '../party-store.service';

import { MembersComponent } from './members.component';

describe('MembersComponent', () => {
    it('reloads roles when the manage dialog is dismissed with the close icon', () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: DialogService,
                    useValue: {
                        open: () => ({
                            afterClosed: () => of({ status: DialogResponseStatus.Cancelled }),
                        }),
                    },
                },
                { provide: NotifyLogService, useValue: { error: vi.fn() } },
                {
                    provide: ThriftOrganizationManagementService,
                    useValue: { ListMembers: () => of({ members: [] }) },
                },
                {
                    provide: PartyStoreService,
                    useValue: {
                        organization: { value: signal({ id: 'org-1', party_id: 'party-1' }) },
                        organizationNotFound: signal(false),
                    },
                },
            ],
        });
        const component = TestBed.runInInjectionContext(() => new MembersComponent());
        const reload = vi.spyOn(component.members, 'reload');

        component.manageRoles({ user: { id: 'user-1' }, roles: [] });

        expect(reload).toHaveBeenCalledOnce();
    });
});
