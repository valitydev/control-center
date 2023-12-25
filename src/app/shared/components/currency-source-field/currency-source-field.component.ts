import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StatSource } from '@vality/fistful-proto/fistful_stat';
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
export class CurrencySourceFieldComponent extends FormControlSuperclass<StatSource> {
    @Input({ transform: booleanAttribute }) required = false;

    options$ = this.fetchSourcesService.sources$.pipe(
        map((sources): Option<StatSource>[] =>
            sources
                .map((s) => ({
                    label: s.currency_symbolic_code,
                    value: s,
                    description: s.name,
                }))
                .sort((a, b) => compareDifferentTypes(a.label, b.label)),
        ),
    );

    constructor(private fetchSourcesService: FetchSourcesService) {
        super();
    }
}
