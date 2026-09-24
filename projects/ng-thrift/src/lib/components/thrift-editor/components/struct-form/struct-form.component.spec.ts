import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ThriftData } from '../../../../models';
import { ThriftAstMetadata } from '../../../../types';

import { StructFormComponent } from './struct-form.component';

@Component({
    imports: [ReactiveFormsModule, StructFormComponent],
    template: `<v-struct-form [data]="data" [formControl]="control" />`,
})
class StructFormHost {
    control = new FormControl<Record<string, unknown>>({});
    metadata: ThriftAstMetadata[] = [
        { name: 'test', path: 'test.thrift', ast: { struct: { Parent: [], Empty: [] } } },
    ];
    data = new ThriftData<string, 'struct'>(
        this.metadata,
        'test',
        'Empty',
        { name: 'empty', type: 'Empty', option: 'optional' },
        new ThriftData(this.metadata, 'test', 'Parent'),
    );
}

describe('Optional struct presence', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    });

    it('checks an empty struct and preserves its value when toggled', async () => {
        const fixture = TestBed.createComponent(StructFormHost);
        await fixture.whenStable();
        const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(checkbox.checked).toBe(true);
        expect(fixture.componentInstance.control.value).toEqual({});

        checkbox.click();
        await fixture.whenStable();
        expect(fixture.componentInstance.control.value).toBeNull();

        checkbox.click();
        await fixture.whenStable();
        expect(fixture.componentInstance.control.value).toEqual({});
    });

    it.each([null, undefined])('leaves an absent struct unchecked (%s)', async (value) => {
        const fixture = TestBed.createComponent(StructFormHost);
        fixture.componentInstance.control.setValue(value);
        await fixture.whenStable();

        const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input');
        expect(checkbox.checked).toBe(false);
    });
});
