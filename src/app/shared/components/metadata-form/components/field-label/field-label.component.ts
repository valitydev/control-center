import { Component, Input } from '@angular/core';

import { MetadataFormData } from '@cc/app/shared';

@Component({
    selector: 'cc-field-label',
    templateUrl: './field-label.component.html',
})
export class FieldLabelComponent {
    @Input() data: MetadataFormData;
}
