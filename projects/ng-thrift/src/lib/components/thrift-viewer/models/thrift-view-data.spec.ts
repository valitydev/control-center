import { firstValueFrom } from 'rxjs';

import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ThriftData } from '../../../models';
import { ThriftTreeViewerComponent } from '../components/thrift-tree-viewer';

import { ThriftViewData } from './thrift-view-data';

@Component({
    imports: [ThriftTreeViewerComponent],
    template: `<v-thrift-tree-viewer [view]="view" />`,
})
class BinaryViewerHost {
    view = new ThriftViewData('AP8=');
}

describe('Binary string viewer', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    });

    async function render(value: string) {
        const fixture = TestBed.createComponent(BinaryViewerHost);
        const view = new ThriftViewData(value, undefined, new ThriftData([], 'test', 'binary'));
        fixture.componentInstance.view = view;
        await fixture.whenStable();
        return { fixture, view };
    }

    it('renders the base64 string as-is', async () => {
        const { fixture, view } = await render('AP8=');
        expect(await firstValueFrom(view.renderValue$)).toBe('AP8=');
        expect(fixture.nativeElement.textContent.trim()).toBe('AP8=');
        expect(fixture.nativeElement.querySelectorAll('v-thrift-tree-value')).toHaveLength(1);
    });

    it('renders empty bytes as an empty value', async () => {
        const { fixture, view } = await render('');
        expect(await firstValueFrom(view.renderValue$)).toBeNull();
        expect(fixture.nativeElement.textContent.trim()).toBe('―');
    });
});
