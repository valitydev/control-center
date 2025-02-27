import { Component, booleanAttribute, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { toJson } from '../../utils';

@Component({
    selector: 'v-thrift-monaco',
    imports: [MonacoEditorModule, FormsModule],
    templateUrl: 'thrift-monaco.component.html',
    styleUrl: './thrift-monaco.component.scss',
})
export class ThriftMonacoComponent {
    value = model();
    original = input();
    readOnly = input(false, { transform: booleanAttribute });

    private modelOptions = { language: 'json' };
    private baseOptions = computed(() => ({
        automaticLayout: true,
        readOnly: this.readOnly(),
    }));
    editorOptions = computed(() => ({
        ...this.baseOptions(),
        ...this.modelOptions,
    }));
    diffOptions = computed(() => ({
        ...this.baseOptions(),
        renderSideBySide: true,
    }));

    innerValue = computed(() => this.outerToInnerValue(this.value()));
    modifiedModel = computed(() => ({
        code: this.innerValue(),
        ...this.modelOptions,
    }));
    originalModel = computed(() => ({
        code: this.outerToInnerValue(this.original()),
        ...this.modelOptions,
    }));

    protected innerToOuterValue(inner: string): unknown {
        return typeof inner === 'string' ? JSON.parse(inner) : '';
    }

    protected outerToInnerValue(outer: unknown): string {
        return outer ? JSON.stringify(toJson(outer), null, 2) : '';
    }
}
