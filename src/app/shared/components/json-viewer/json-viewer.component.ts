import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { ValueType, Field } from '@vality/thrift-ts';
import { map } from 'rxjs';
import yaml from 'yaml';

import { MetadataFormData } from '../metadata-form';
import { MetadataViewItem } from './utils/metadata-view';
import {
    MetadataViewExtension,
    MetadataViewExtensionResult,
} from './utils/metadata-view-extension';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
    styleUrls: ['./json-viewer.scss'],
})
export class JsonViewerComponent implements OnChanges {
    @Input() value: unknown;
    @Input() level = 0;
    @Input() extension?: MetadataViewExtensionResult;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;

    @Input() data: MetadataFormData;
    @Input() extensions: MetadataViewExtension[];

    view: MetadataViewItem;
    className = this.getClassName();
    extensionQueryParams$ = this.route.queryParams.pipe(
        map((params) => Object.assign({}, params, this.extension?.link?.[1]?.queryParams))
    );

    constructor(private route: ActivatedRoute) {}

    ngOnChanges() {
        if (this.metadata && this.namespace && this.type) {
            try {
                this.data = new MetadataFormData(
                    this.metadata,
                    this.namespace,
                    this.type,
                    this.field,
                    this.parent
                );
            } catch (err) {
                this.data = undefined;
                console.warn(err);
            }
        }
        this.view = new MetadataViewItem(this.value, undefined, this.data, this.extensions);
        this.className = this.getClassName();
    }

    getClassName() {
        switch (this.level) {
            case 0:
                return 'mat-h2';
            case 1:
                return 'mat-h3';
            case 2:
                return 'mat-h4';
            default:
                return 'mat-body-2';
        }
    }

    getTooltip(tooltip: any) {
        return typeof tooltip === 'object' ? yaml.stringify(tooltip) : String(tooltip);
    }
}
