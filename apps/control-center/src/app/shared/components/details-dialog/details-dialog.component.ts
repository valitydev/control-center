import { Component } from '@angular/core';
import { DialogSuperclass, DialogModule, DEFAULT_DIALOG_CONFIG } from '@vality/matez';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer';

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
