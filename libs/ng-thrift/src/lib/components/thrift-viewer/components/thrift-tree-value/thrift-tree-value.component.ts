import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TagModule } from '@vality/matez';
import { combineLatest, map } from 'rxjs';
import yaml from 'yaml';

import { ThriftViewExtensionResult } from '../../utils/thrift-view-extension-result';

@Component({
    selector: 'v-thrift-tree-value',
    templateUrl: './thrift-tree-value.component.html',
    styleUrl: './thrift-tree-value.component.scss',
    imports: [CommonModule, RouterModule, TagModule, MatTooltipModule],
})
export class ThriftTreeValueComponent {
    readonly renderValue = input.required<unknown>();
    readonly extension = input<ThriftViewExtensionResult | null>();

    extensionQueryParams$ = combineLatest([
        this.route.queryParams,
        toObservable(this.extension),
    ]).pipe(
        map(([params, extension]) => Object.assign({}, params, extension?.link?.[1]?.queryParams)),
    );
    tooltip = computed(() =>
        typeof this.extension()?.tooltip === 'object'
            ? yaml.stringify(this.extension()?.tooltip)
            : String(this.extension()?.tooltip),
    );

    constructor(private route: ActivatedRoute) {}
}
