import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
    SelectFieldModule,
    FormControlSuperclass,
    Option,
    compareDifferentTypes,
    createControlProviders,
} from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { FetchSourcesService } from '../../../sections/sources';

@Component({
    selector: 'cc-currency-source-field',
    standalone: true,
    imports: [CommonModule, SelectFieldModule, ReactiveFormsModule],
    templateUrl: './currency-source-field.component.html',
    providers: createControlProviders(() => CurrencySourceFieldComponent),
})
export class CurrencySourceFieldComponent extends FormControlSuperclass<string> {
    options$ = this.fetchSourcesService.sources$.pipe(
        map((sources): Option<string>[] =>
            sources
                .map((s) => ({
                    label: s.currency_symbolic_code,
                    value: s.id,
                    description: s.name,
                }))
                .sort((a, b) => compareDifferentTypes(a.label, b.label)),
        ),
    );

    constructor(private fetchSourcesService: FetchSourcesService) {
        super();
    }
}
