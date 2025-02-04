import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TagModule } from '@vality/matez';
import { Field, ValueType } from '@vality/thrift-ts';
import { map } from 'rxjs';
import yaml from 'yaml';

import { ThriftData } from '../../../../models';
import { ThriftPipesModule } from '../../../../pipes';
import { ThriftAstMetadata } from '../../../../types';
import { ThriftViewData } from '../../utils/thrift-view-data';
import { ThriftViewExtension } from '../../utils/thrift-view-extension';
import { ThriftViewExtensionResult } from '../../utils/thrift-view-extension-result';
import { KeyComponent } from '../key/key.component';

@Component({
    selector: 'v-thrift-tree-viewer',
    templateUrl: './thrift-tree-viewer.component.html',
    styleUrls: ['./thrift-tree-viewer.scss'],
    imports: [
        CommonModule,
        MatDividerModule,
        MatCardModule,
        ThriftPipesModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule,
        RouterModule,
        TagModule,
        KeyComponent,
    ],
})
export class ThriftTreeViewerComponent implements OnChanges {
    @Input() value: unknown;
    @Input() level = 0;
    @Input() extension?: ThriftViewExtensionResult | null;

    @Input() metadata!: ThriftAstMetadata[];
    @Input() namespace!: string;
    @Input() type!: ValueType;
    @Input() field?: Field;
    @Input() parent?: ThriftData;

    @Input() data?: ThriftData | null;
    @Input() extensions?: ThriftViewExtension[];

    view!: ThriftViewData;
    className = this.getClassName();
    extensionQueryParams$ = this.route.queryParams.pipe(
        map((params) => Object.assign({}, params, this.extension?.link?.[1]?.queryParams)),
    );

    constructor(private route: ActivatedRoute) {}

    ngOnChanges() {
        if (this.metadata && this.namespace && this.type) {
            try {
                this.data = new ThriftData(
                    this.metadata,
                    this.namespace,
                    this.type,
                    this.field,
                    this.parent,
                );
            } catch (err) {
                this.data = undefined;
                console.warn(err);
            }
        }
        this.view = new ThriftViewData(this.value, undefined, this.data, this.extensions);
        this.className = this.getClassName(this.level);
    }

    private getClassName(level: number) {
        switch (level) {
            case 0:
                return 'mat-title-large';
            case 1:
                return 'mat-title-medium';
            case 2:
                return 'mat-body-large';
            default:
                return 'mat-body-large';
        }
    }

    getTooltip(tooltip: unknown) {
        return typeof tooltip === 'object' ? yaml.stringify(tooltip) : String(tooltip);
    }
}
