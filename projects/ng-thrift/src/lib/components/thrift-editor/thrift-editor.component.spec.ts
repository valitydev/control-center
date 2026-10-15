import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import {
    type CreateOrganizationRequest,
    domain,
    loadThriftMetadata,
} from '@vality/org-management-proto/admin_management';
import type { Metadata } from '@vality/tsthrift';

import { ThriftData } from '../../models';
import { ThriftViewerModule } from '../thrift-viewer';

import { ThriftEditorModule } from './thrift-editor.module';

@Component({
    imports: [FormsModule, ThriftEditorModule, ThriftViewerModule],
    template: `
        <v-thrift-editor
            [(ngModel)]="request"
            [metadata]="metadata"
            namespace="admin_management"
            noToolbar
            type="CreateOrganizationRequest"
        />
        <v-thrift-viewer
            [metadata]="metadata"
            [value]="status"
            namespace="domain"
            type="OrganizationStatus"
        />
    `,
})
class MetadataHost {
    metadata: Metadata[] = [];
    request: CreateOrganizationRequest = {
        party_id: 'party-1',
        owner_id: 'owner-1',
        name: 'Organization',
        allowed_ips: new Set(['192.0.2.1']),
    };
    status = domain.OrganizationStatus.active;
}

describe('Generated tsthrift metadata', () => {
    let metadata: Metadata[];

    beforeAll(async () => {
        metadata = await loadThriftMetadata();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    });

    async function render() {
        const fixture = TestBed.createComponent(MetadataHost);
        fixture.componentInstance.metadata = metadata;
        await fixture.whenStable();
        return fixture;
    }

    it('resolves numeric field IDs and typedefs across generated namespace includes', () => {
        const request = new ThriftData<string, 'struct'>(
            metadata,
            'admin_management',
            'CreateOrganizationRequest',
        );
        const field = request.ast.find((candidate) => candidate.name === 'party_id')!;
        const party = request.create({ field }).trueTypeNode;

        expect(field.id).toBe(1);
        expect(party.typedefs.map((data) => data.type)).toContain('PartyID');
        expect(party.data.namespace).toBe('domain');
        expect(party.data.type).toBe('string');
    });

    it('edits a generated set field while preserving the request values', async () => {
        const fixture = await render();
        const header: HTMLElement = fixture.nativeElement.querySelector(
            'v-complex-form mat-expansion-panel-header',
        );
        header.click();
        await fixture.whenStable();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('v-complex-form input');
        expect(input.value).toBe('192.0.2.1');

        input.value = '2001:db8::1';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        expect(fixture.componentInstance.request).toEqual({
            party_id: 'party-1',
            owner_id: 'owner-1',
            name: 'Organization',
            allowed_ips: new Set(['2001:db8::1']),
        });
    });

    it('renders enum names from generated tsthrift metadata', async () => {
        const fixture = await render();
        const viewer: HTMLElement = fixture.nativeElement.querySelector('v-thrift-viewer');

        expect(viewer.textContent).toContain('active');
    });
});
