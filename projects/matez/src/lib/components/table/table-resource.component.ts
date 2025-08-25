import { TableModule } from './table.module';
import { booleanAttribute, Component, input, model } from '@angular/core';
import { Column, PagedObservableResource } from '@vality/matez';

@Component({
    selector: 'v-table-resource',
    template: `
        <v-table
            [(filter)]="filter"
            [columns]="columns()"
            [data]="resource().value()"
            [externalFilter]="externalFilter()"
            [hasMore]="resource().hasMore()"
            [noDownload]="noDownload()"
            [progress]="resource().isLoading()"
            [standaloneFilter]="standaloneFilter()"
            (more)="resource().more()"
            (update)="resource().setOptions($event)"
        >
            <ng-content></ng-content>
        </v-table>
    `,
    imports: [TableModule],
})
export class TableResourceComponent<T extends object, C extends object> {
    resource = input<PagedObservableResource<T, unknown>>();
    columns = input<Column<T, C>[]>([]);
    filter = model('');
    externalFilter = input(false, { transform: booleanAttribute });
    noDownload = input(false, { transform: booleanAttribute });
    standaloneFilter = input(false, { transform: booleanAttribute });
}
