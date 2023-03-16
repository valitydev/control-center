import { Component, OnInit } from '@angular/core';

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
export class SourcesComponent implements OnInit {
    sources$ = this.fetchSourcesService.searchResult$;
    hasMore$ = this.fetchSourcesService.hasMore$;
    inProgress$ = this.fetchSourcesService.doAction$;
    cols = new Columns('id', 'currency_symbolic_code');

    constructor(private fetchSourcesService: FetchSourcesService) {}

    ngOnInit() {
        this.fetchSourcesService.search({});
    }

    create() {
        return null;
    }

    fetchMore() {
        this.fetchSourcesService.fetchMore();
    }
}
