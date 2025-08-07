import { Component, computed, input } from '@angular/core';
import { Value, ValueComponent } from '@vality/matez';
import yaml from 'yaml';

import { ThriftViewExtensionResult } from '../../utils/thrift-view-extension-result';

@Component({
    selector: 'v-thrift-tree-value',
    templateUrl: './thrift-tree-value.component.html',
    imports: [ValueComponent],
})
export class ThriftTreeValueComponent {
    readonly renderValue = input.required<unknown>();
    readonly extension = input<ThriftViewExtensionResult | null>();

    value = computed((): Value => {
        const extension = this.extension();
        if (!extension) {
            return { value: this.renderValue() };
        }
        const tooltip = extension?.tooltip
            ? typeof extension.tooltip === 'object'
                ? yaml.stringify(extension.tooltip)
                : String(extension?.tooltip)
            : undefined;
        const link = extension.link ? () => extension.link ?? '' : undefined;
        return {
            value: this.renderValue(),
            tooltip,
            click: extension.click,
            link,
            color: extension.color,
        };
    });
}
