import { Component, Input, OnChanges } from '@angular/core';
import { ComponentChanges } from '@vality/ng-core';
import { of, switchMap, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetadataViewItem } from '../../utils/metadata-view';

@Component({
    selector: 'cc-key',
    templateUrl: './key.component.html',
    styleUrls: ['./key.component.scss'],
})
export class KeyComponent implements OnChanges {
    @Input() keys?: MetadataViewItem[];
    keys$ = new ReplaySubject<MetadataViewItem[]>(1);
    numberKey$ = this.keys$.pipe(
        switchMap((keys) => {
            if (keys.length !== 1) return of(null);
            return this.keys[0].key$.pipe(
                switchMap((key) => key.renderValue$),
                map((value) => {
                    if (typeof value === 'number') return `${value + 1}`;
                    return null;
                })
            );
        })
    );

    ngOnChanges(changes: ComponentChanges<KeyComponent>) {
        if (changes.keys) this.keys$.next(this.keys);
    }

    parentIsUnion(pathItem: MetadataViewItem) {
        if (!pathItem?.data$) return of(false);
        return pathItem.data$.pipe(map((data) => data?.trueParent?.objectType === 'union'));
    }

    isUnion(pathItem: MetadataViewItem) {
        if (!pathItem?.data$) return of(false);
        return pathItem.data$.pipe(map((data) => data?.trueTypeNode?.data?.objectType === 'union'));
    }
}
