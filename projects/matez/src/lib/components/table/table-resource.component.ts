import { Component, TemplateRef, booleanAttribute, computed, input, model } from '@angular/core';

import { Column, ObservableResource, PagedObservableResource, UpdateOptions } from '@vality/matez';

import { TableModule } from './table.module';

@Component({
    selector: 'v-table-resource',
    template: `
        <v-table
            [(filter)]="filter"
            [columns]="columns()"
            [data]="resource().value()"
            [externalFilter]="externalFilter()"
            [hasMore]="hasMore()"
            [noDownload]="noDownload()"
            [progress]="resource().isLoading()"
            [standaloneFilter]="standaloneFilter()"
            [tableInputsContent]="tableInputsContent()"
            (more)="more()"
            (reload)="resource().reload()"
            (update)="update($event)"
        >
            <v-table-actions><ng-content select="v-table-actions"></ng-content></v-table-actions>
        </v-table>
    `,
    imports: [TableModule],
})
export class TableResourceComponent<T extends object, C extends object> {
    resource = input<PagedObservableResource<T, unknown> | ObservableResource<T[], unknown>>();
    columns = input<Column<T, C>[]>([]);
    filter = model('');
    externalFilter = input(false, { transform: booleanAttribute });
    noDownload = input(false, { transform: booleanAttribute });
    standaloneFilter = input(false, { transform: booleanAttribute });
    tableInputsContent = input<TemplateRef<unknown>>();

    hasMore = computed(() => {
        const res = this.resource();
        return 'hasMore' in res ? res.hasMore() : false;
    });

    more() {
        const res = this.resource();
        if ('more' in res) res.more();
    }

    update(options: UpdateOptions) {
        const res = this.resource();
        if ('setOptions' in res) res.setOptions(options);
    }
}
