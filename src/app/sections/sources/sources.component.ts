import { Component } from '@angular/core';
import { StatSource } from '@vality/fistful-proto/internal/fistful_stat';
import { BaseDialogService } from '@vality/ng-core';

import { Schema } from '@cc/components/simple-table';

import { CreateSourceComponent } from './create-source/create-source.component';
import { FetchSourcesService } from './fetch-sources.service';

@Component({
    templateUrl: './sources.component.html',
    styles: [
        `
            :host {
                display: block;
                padding: 24px 16px;
            }
        `,
    ],
})
export class SourcesComponent {
    sources$ = this.fetchSourcesService.sources$;
    progress$ = this.fetchSourcesService.progress$;
    schema = new Schema<StatSource>([
        { value: 'name', description: 'id' },
        'identity',
        'currency_symbolic_code',
        'created_at',
    ]);

    constructor(
        private fetchSourcesService: FetchSourcesService,
        private baseDialogService: BaseDialogService
    ) {}

    create() {
        this.baseDialogService.open(CreateSourceComponent);
    }
}
