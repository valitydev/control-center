import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
    AbstractControlSuperclass,
    AutocompleteFieldModule,
    createControlProviders,
} from '@vality/matez';

import { AccountFieldComponent, CurrencyAccount } from '../account-field';

@Component({
    selector: 'cc-system-accounts-field',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AutocompleteFieldModule,
        MatButtonModule,
        MatIconModule,
        AccountFieldComponent,
    ],
    templateUrl: './system-accounts-field.component.html',
    providers: createControlProviders(() => SystemAccountsFieldComponent),
})
export class SystemAccountsFieldComponent extends AbstractControlSuperclass<CurrencyAccount[]> {
    accountsNumber = input(1);

    control = new FormArray<FormControl<CurrencyAccount>>([]);

    add() {
        this.control.push(new FormControl<CurrencyAccount>(null));
    }

    remove(index: number) {
        this.control.removeAt(index);
    }
}
