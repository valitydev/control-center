import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Field, ValueType } from '@vality/thrift-ts';
import { map } from 'rxjs';
import yaml from 'yaml';

import { ThriftData } from '../../models';
import { ThriftAstMetadata } from '../../types';

import { ThriftViewExtension, ThriftViewExtensionResult } from './utils/thrift-view-extension';
import { ThriftViewData } from './utils/thrift-view-data';

@Component({
    selector: 'v-thrift-tree-viewer',
    templateUrl: './thrift-tree-viewer.component.html',
    styleUrls: ['./thrift-tree-viewer.scss'],
    standalone: false,
})
export class ThriftTreeViewerComponent implements OnChanges {
    @Input() value: unknown;
    @Input() level = 0;
    @Input() extension?: ThriftViewExtensionResult;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: ThriftData;

    @Input() data: ThriftData;
    @Input() extensions: ThriftViewExtension[];

    view: ThriftViewData;
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
        this.className = this.getClassName();
    }

    getClassName() {
        switch (this.level) {
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
