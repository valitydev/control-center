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

    it.each(['AP8=', ''])('renders the string as-is, including empty bytes (%s)', async (value) => {
        const fixture = TestBed.createComponent(BinaryViewerHost);
        const view = new ThriftViewData(value, undefined, new ThriftData([], 'test', 'binary'));
        fixture.componentInstance.view = view;
        await fixture.whenStable();
        expect(await firstValueFrom(view.renderValue$)).toBe(value);
        expect(fixture.nativeElement.textContent.trim()).toBe(value);
        expect(fixture.nativeElement.querySelectorAll('v-thrift-tree-value')).toHaveLength(1);
    });
});
