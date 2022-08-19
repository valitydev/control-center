import { Component } from '@angular/core';
import { BaseDialogSuperclass, BaseDialogModule, DEFAULT_DIALOG_CONFIG } from '@vality/ng-core';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer';

@Component({
    standalone: true,
    selector: 'cc-details-dialog',
    templateUrl: './details-dialog.component.html',
    imports: [BaseDialogModule, JsonViewerModule],
})
export class DetailsDialogComponent extends BaseDialogSuperclass<
    DetailsDialogComponent,
    { title?: string; json: unknown }
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;
}
