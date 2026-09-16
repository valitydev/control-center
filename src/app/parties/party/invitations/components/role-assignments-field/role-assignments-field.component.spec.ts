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
                nodes: new Set([
                    type === DomainObjectType.wallet_config
                        ? { ref: { wallet_config: { id: 'wallet-1' } }, name: 'Test wallet' }
                        : { ref: { shop_config: { id: 'shop-1' } }, name: 'Test shop' },
                ]),
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
        expect(fixture.componentInstance.value()).toEqual([{ role_id: 'Integrator' }]);
        expect(Object.hasOwn(fixture.componentInstance.value()[0], 'scope')).toBe(false);
    });

    it('selects shops and wallets, clearing the resource when switching scope', async () => {
        fixture.componentInstance.addRole();
        await fixture.whenStable();
        await selectOption('cc-shop-field', 'Test shop');
        expect(fixture.componentInstance.value()[0].scope).toEqual({
            scope_id: 'Shop',
            resource_id: 'shop-1',
        });

        await selectOption('mat-expansion-panel > div v-select-field:nth-child(2)', 'Wallet');
        expect(fixture.nativeElement.querySelector('cc-shop-field')).toBeNull();
        expect(
            fixture.nativeElement.querySelector('cc-wallet-field .ng-select-has-value'),
        ).toBeNull();
        expect(fixture.componentInstance.value()[0]).not.toHaveProperty('scope');

        await selectOption('cc-wallet-field', 'Test wallet');
        expect(fixture.componentInstance.value()[0].scope).toEqual({
            scope_id: 'Wallet',
            resource_id: 'wallet-1',
        });

        fixture.nativeElement
            .querySelector('cc-wallet-field .ng-select-clear')
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await fixture.whenStable();
        expect(fixture.componentInstance.value()[0]).not.toHaveProperty('scope');
        expect(
            fixture.nativeElement.querySelector('cc-wallet-field .ng-select-has-value'),
        ).toBeNull();
    });

    it('restores an existing wallet scope', async () => {
        fixture.componentRef.setInput('value', [
            { role_id: 'Integrator', scope: { scope_id: 'Wallet', resource_id: 'wallet-1' } },
        ]);
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('cc-wallet-field').textContent).toContain(
            'Test wallet',
        );
        expect(fixture.componentInstance.value()[0].scope.resource_id).toBe('wallet-1');
    });
});
