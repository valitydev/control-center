import { Component } from '@angular/core';
import { DEFAULT_DIALOG_CONFIG, DialogModule, DialogSuperclass } from '@vality/matez';
import { JsonViewerModule } from '@vality/ng-thrift';

@Component({
    standalone: true,
    selector: 'cc-details-dialog',
    templateUrl: './details-dialog.component.html',
    imports: [DialogModule, JsonViewerModule],
})
export class DetailsDialogComponent extends DialogSuperclass<
    DetailsDialogComponent,
    { title?: string; json: unknown }
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;
}
