import { of } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainObjectType } from '@vality/domain-proto/domain';

import { ThriftRepositoryService } from '~/api/services';

import { RoleAssignmentsFieldComponent } from './role-assignments-field.component';

describe('RoleAssignmentsFieldComponent', () => {
    let fixture: ComponentFixture<RoleAssignmentsFieldComponent>;
    const repository = {
        GetRelatedGraph: vi.fn(({ type }) =>
            of({
                nodes: new Set(
                    type === DomainObjectType.wallet_config
                        ? [
                              { ref: { wallet_config: { id: 'wallet-1' } }, name: 'Test wallet 1' },
                              { ref: { wallet_config: { id: 'wallet-2' } }, name: 'Test wallet 2' },
                          ]
                        : [
                              { ref: { shop_config: { id: 'shop-1' } }, name: 'Test shop 1' },
                              { ref: { shop_config: { id: 'shop-2' } }, name: 'Test shop 2' },
                          ],
                ),
            }),
        ),
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [RoleAssignmentsFieldComponent],
            providers: [
                provideZonelessChangeDetection(),
                { provide: ThriftRepositoryService, useValue: repository },
            ],
        });
        fixture = TestBed.createComponent(RoleAssignmentsFieldComponent);
        fixture.componentRef.setInput('partyId', 'party-1');
        await fixture.whenStable();
    });

    async function selectOption(selector: string, label: string) {
        const field = fixture.nativeElement.querySelector(selector) as HTMLElement;
        field.querySelector<HTMLElement>('.ng-select-control').click();
        await fixture.whenStable();
        const option = Array.from(document.querySelectorAll<HTMLElement>('.ng-select-option')).find(
            (item) => item.textContent.includes(label),
        );
        expect(option).toBeDefined();
        option.click();
        await fixture.whenStable();
    }

    it('shows a placeholder and omits scope until a resource is selected', async () => {
        fixture.nativeElement.querySelector('button').click();
        await fixture.whenStable();

        const shop = fixture.nativeElement.querySelector('cc-shop-field');
        expect(shop.querySelector('.ng-select-has-value')).toBeNull();
        expect(shop.querySelector('.ng-select-placeholder').textContent).toContain(
            'Entire organization',
        );
        expect(fixture.componentInstance.value()).toEqual([{ role_id: 'Administrator' }]);
        expect(Object.hasOwn(fixture.componentInstance.value()[0], 'scope')).toBe(false);
    });

    it('selects multiple shops and creates multiple role assignments', async () => {
        fixture.componentInstance.addRole();
        await fixture.whenStable();

        await selectOption('cc-shop-field', 'Test shop 1');
        expect(fixture.componentInstance.value()).toEqual([
            { role_id: 'Administrator', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
        ]);

        await selectOption('cc-shop-field', 'Test shop 2');
        expect(fixture.componentInstance.value()).toEqual([
            { role_id: 'Administrator', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            { role_id: 'Administrator', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
        ]);
    });

    it('clears resources when switching scope and selects multiple wallets', async () => {
        fixture.componentInstance.addRole();
        await fixture.whenStable();

        await selectOption('cc-shop-field', 'Test shop 1');
        expect(fixture.componentInstance.value()).toEqual([
            { role_id: 'Administrator', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
        ]);

        await selectOption('cc-role-assignment-field v-select-field:nth-of-type(2)', 'Wallet');
        expect(fixture.nativeElement.querySelector('cc-shop-field')).toBeNull();
        expect(
            fixture.nativeElement.querySelector('cc-wallet-field .ng-select-has-value'),
        ).toBeNull();
        expect(fixture.componentInstance.value()).toEqual([{ role_id: 'Administrator' }]);

        await selectOption('cc-wallet-field', 'Test wallet 1');
        expect(fixture.componentInstance.value()).toEqual([
            { role_id: 'Administrator', scope: { scope_id: 'Wallet', resource_id: 'wallet-1' } },
        ]);
    });

    it('restores and groups existing roles for the same role and scope', async () => {
        fixture.componentRef.setInput('value', [
            { role_id: 'Integrator', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            { role_id: 'Integrator', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
        ]);
        await fixture.whenStable();

        expect(fixture.componentInstance.groups()).toMatchObject([
            {
                roleId: 'Integrator',
                scopeId: 'Shop',
                resourceIds: ['shop-1', 'shop-2'],
            },
        ]);
        expect(fixture.nativeElement.querySelector('cc-shop-field').textContent).toContain(
            'Test shop 1',
        );
        expect(fixture.nativeElement.querySelector('cc-shop-field').textContent).toContain(
            'Test shop 2',
        );
    });

    it('expands newly added role panel', async () => {
        fixture.componentRef.setInput('value', [{ role_id: 'Administrator' }]);
        await fixture.whenStable();

        expect(fixture.componentInstance.expandedIndex()).toBeNull();

        fixture.componentInstance.addRole();
        await fixture.whenStable();

        expect(fixture.componentInstance.expandedIndex()).toBe(1);
        const panels = fixture.nativeElement.querySelectorAll('mat-expansion-panel');
        expect(panels.length).toBe(2);
        expect(
            panels[1].querySelector('mat-expansion-panel-header').getAttribute('aria-expanded'),
        ).toBe('true');
        await vi.waitFor(() => {
            expect(
                panels[1]
                    .querySelector('cc-role-assignment-field')
                    .contains(document.activeElement),
            ).toBe(true);
        });
    });
});
