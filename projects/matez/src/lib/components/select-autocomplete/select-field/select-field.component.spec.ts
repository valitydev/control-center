import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, disabled, form } from '@angular/forms/signals';

import { InputFieldModule } from '../../input-field';

import { SelectFieldModule } from './select-field.module';

@Component({
    imports: [InputFieldModule, SelectFieldModule, ReactiveFormsModule, FormField],
    template: `
        <v-input-field [formField]="fields.email" label="Email" />
        <v-select-field [formField]="fields.selection" [options]="options" label="Signal select" />
        <v-input-field [formControl]="text" label="Reactive input" />
        <v-select-field [formControl]="selection" [options]="options" label="Reactive select" />
        <v-select-field [formControl]="multiple" [options]="options" label="Multiple" multiple />
    `,
})
class FieldsHost {
    model = signal({ email: '', selection: '' });
    isDisabled = signal(false);
    fields = form(this.model, (path) => disabled(path, () => this.isDisabled()));
    text = new FormControl('initial');
    selection = new FormControl('one');
    multiple = new FormControl(['one']);
    options = [
        { label: 'One', value: 'one' },
        { label: 'Two', value: 'two' },
    ];
}

describe('Shared fields form integration', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    });
    it('renders empty signal selects and updates and disables signal inputs', async () => {
        const fixture = TestBed.createComponent(FieldsHost);
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement;
        expect(
            element.querySelector('v-select-field').querySelector('.ng-select-has-value'),
        ).toBeNull();
        const input = element.querySelector('input');
        input.value = 'member@example.com';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        await fixture.whenStable();
        expect(fixture.componentInstance.model().email).toBe('member@example.com');
        expect(fixture.componentInstance.fields.email().touched()).toBe(true);

        fixture.componentInstance.isDisabled.set(true);
        await fixture.whenStable();
        expect(input.disabled).toBe(true);
        expect(
            element.querySelector('v-select-field').querySelector('.ng-select-disabled'),
        ).not.toBeNull();
    });

    it('preserves reactive value, touch, disabled, reset and multiple-selection bindings', async () => {
        const fixture = TestBed.createComponent(FieldsHost);
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement;
        const input = element.querySelectorAll('v-input-field input')[1] as HTMLInputElement;
        expect(input.value).toBe('initial');
        input.value = 'changed';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        await fixture.whenStable();
        expect(fixture.componentInstance.text.value).toBe('changed');
        expect(fixture.componentInstance.text.touched).toBe(true);

        const selects = element.querySelectorAll('v-select-field');
        expect(selects[1].querySelector('.ng-select-value').textContent).toContain('One');
        selects[1].querySelector<HTMLElement>('.ng-select-control').click();
        await fixture.whenStable();
        Array.from(document.querySelectorAll<HTMLElement>('.ng-select-option'))
            .find((option) => option.textContent.includes('Two'))
            .click();
        await fixture.whenStable();
        expect(fixture.componentInstance.selection.value).toBe('two');

        fixture.componentInstance.selection.disable();
        fixture.componentInstance.text.disable();
        fixture.componentInstance.multiple.setValue(['one', 'two']);
        await fixture.whenStable();
        expect(input.disabled).toBe(true);
        expect(selects[1].querySelector('.ng-select-disabled')).not.toBeNull();
        expect(selects[2].querySelectorAll('.ng-select-value').length).toBe(2);

        fixture.componentInstance.selection.reset();
        await fixture.whenStable();
        expect(selects[1].querySelector('.ng-select-has-value')).toBeNull();
    });
});
