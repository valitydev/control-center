import { Component, Input } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetadataViewItem } from '../../utils/metadata-view';

@Component({
    selector: 'cc-key',
    templateUrl: './key.component.html',
})
export class KeyComponent {
    @Input() keys?: MetadataViewItem[];

    get numberKey$() {
        if (this.keys.length > 1) return of(null);
        return this.keys[0].key$.pipe(
            switchMap((key) => key.renderValue$),
            map((value) => {
                if (typeof value === 'number') return `${value + 1}`;
                return null;
            })
        );
    }
}
