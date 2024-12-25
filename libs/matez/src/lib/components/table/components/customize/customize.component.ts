import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DialogSuperclass } from '../../../dialog';
import { Column, NormColumn } from '../../types';

interface CustomizedColumn {
    priority: number;
    name: string;
    hidden: boolean;
}

@Component({
    selector: 'v-customize',
    templateUrl: './customize.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizeComponent extends DialogSuperclass<
    CustomizeComponent,
    { columns: NormColumn<object>[] }
> {
    columns: Column<CustomizedColumn>[] = [
        { field: 'priority', header: 'Number' },
        { field: 'name' },
        { field: 'hidden' },
    ];

    data: CustomizedColumn[] = this.dialogData.columns.map((c, idx) => ({
        priority: idx + 1,
        name: c.field,
        hidden: false,
    }));
}
