import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ContentLoadingComponent, TagModule } from '@vality/matez';
import { Field, ValueType } from '@vality/thrift-ts';
import { map } from 'rxjs';
import yaml from 'yaml';

import { ThriftData } from '../../../../models';
import { ThriftPipesModule } from '../../../../pipes';
import { ThriftAstMetadata } from '../../../../types';
import { ThriftViewData } from '../../models/thrift-view-data';
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
        ContentLoadingComponent,
        ContentLoadingComponent,
    ],
})
export class ThriftTreeViewerComponent {
    readonly value = input<unknown>();
    readonly level = input(0);
    readonly extension = input<ThriftViewExtensionResult | null>();

    readonly metadata = input<ThriftAstMetadata[]>();
    readonly namespace = input<string>();
    readonly type = input<ValueType>();
    readonly field = input<Field>();
    readonly parent = input<ThriftData>();

    readonly data = input<ThriftData | null>();
    readonly extensions = input<ThriftViewExtension[]>();

    viewData = computed(() => {
        if (this.data()) {
            return this.data();
        }
        const metadata = this.metadata();
        const namespace = this.namespace();
        const type = this.type();
        if (metadata && namespace && type) {
            return new ThriftData(metadata, namespace, type, this.field(), this.parent());
        }
        return undefined;
    });
    view = computed(
        () => new ThriftViewData(this.value(), undefined, this.viewData(), this.extensions()),
    );
    extensionQueryParams$ = this.route.queryParams.pipe(
        map((params) => Object.assign({}, params, this.extension()?.link?.[1]?.queryParams)),
    );

    constructor(private route: ActivatedRoute) {}

    getTooltip(tooltip: unknown) {
        return typeof tooltip === 'object' ? yaml.stringify(tooltip) : String(tooltip);
    }
}
