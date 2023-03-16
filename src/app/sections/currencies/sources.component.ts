import { Component } from '@angular/core';

import { Columns } from '../../../components/table';
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
    cols = new Columns('id', 'currency_symbolic_code');

    constructor(private fetchSourcesService: FetchSourcesService) {}

    create() {
        return null;
    }
}
