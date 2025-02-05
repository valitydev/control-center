import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ComponentChanges } from '@vality/matez';
import { ReplaySubject, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThriftPipesModule } from '../../../../pipes';
import { ThriftViewData } from '../../models/thrift-view-data';

@Component({
    selector: 'v-thrift-tree-key',
    templateUrl: './thrift-tree-key.component.html',
    styleUrls: ['./thrift-tree-key.component.scss'],
    imports: [CommonModule, ThriftPipesModule],
})
export class ThriftTreeKeyComponent implements OnChanges {
    @Input() keys?: ThriftViewData[] | null;
    keys$ = new ReplaySubject<ThriftViewData[]>(1);
    numberKey$ = this.keys$.pipe(
        switchMap((keys) => {
            if (keys.length !== 1) {
                return of(null);
            }
            return (this.keys as ThriftViewData[])[0].key$.pipe(
                switchMap((key) => key.renderValue$),
                map((value) => {
                    if (typeof value === 'number') {
                        return `${value + 1}`;
                    }
                    return null;
                }),
            );
        }),
    );

    ngOnChanges(changes: ComponentChanges<ThriftTreeKeyComponent>) {
        if (changes.keys) {
            this.keys$.next(this.keys as ThriftViewData[]);
        }
    }

    parentIsUnion(pathItem: ThriftViewData) {
        if (!pathItem?.data$) {
            return of(false);
        }
        return pathItem.data$.pipe(map((data) => data?.trueParent?.objectType === 'union'));
    }

    isUnion(pathItem: ThriftViewData) {
        if (!pathItem?.data$) {
            return of(false);
        }
        return pathItem.data$.pipe(map((data) => data?.trueTypeNode?.data?.objectType === 'union'));
    }
}
