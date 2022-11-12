import { Component, Input } from '@angular/core';

import { MetadataViewItem } from '../../utils/metadata-view';

@Component({
    selector: 'cc-key',
    templateUrl: './key.component.html',
})
export class KeyComponent {
    @Input() keys?: MetadataViewItem[];
}
