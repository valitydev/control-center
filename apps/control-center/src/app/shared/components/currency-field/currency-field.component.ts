import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
    AutocompleteFieldModule,
    FormControlSuperclass,
    Option,
    createControlProviders,
} from '@vality/matez';
import { map } from 'rxjs/operators';

import { FetchSourcesService } from '../../../sections/sources';

@Component({
    selector: 'cc-currency-field',
    imports: [CommonModule, ReactiveFormsModule, AutocompleteFieldModule],
    templateUrl: './currency-field.component.html',
    providers: createControlProviders(() => CurrencyFieldComponent)
})
export class CurrencyFieldComponent extends FormControlSuperclass<string> {
    options$ = this.fetchSourcesService.sources$.pipe(
        map((sources): Option<string>[] => {
            const codes = [...new Set(sources.map((s) => s.currency_symbolic_code))].sort();
            return codes.map((code) => ({
                label: code,
                value: code,
            }));
        }),
    );

    constructor(private fetchSourcesService: FetchSourcesService) {
        super();
    }
}
