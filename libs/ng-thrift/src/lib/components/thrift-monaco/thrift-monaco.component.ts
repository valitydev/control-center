import { Component, booleanAttribute, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { toJson } from '../../utils';

@Component({
    selector: 'v-thrift-monaco',
    imports: [MonacoEditorModule, FormsModule],
    templateUrl: 'thrift-monaco.component.html',
    styleUrl: './thrift-monaco.component.scss',
})
export class ThriftMonacoComponent<T> {
    value = model.required<T>();
    original = input<T>();
    readOnly = input(false, { transform: booleanAttribute });
    parseError = output<unknown | null>();

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

    innerValue = computed(() => this.stringifyThrift(this.value()));
    modifiedModel = computed(() => ({
        code: this.innerValue(),
        ...this.modelOptions,
    }));
    originalModel = computed(() => ({
        code: this.stringifyThrift(this.original()),
        ...this.modelOptions,
    }));

    stringifyThrift(outer: unknown): string {
        return outer ? JSON.stringify(toJson(outer), null, 2) : '';
    }

    modelChange(inner: string) {
        try {
            const value = typeof inner === 'string' ? JSON.parse(inner) : '';
            this.value.set(value);
            this.parseError.emit(null);
        } catch (err) {
            console.warn(err);
            this.parseError.emit(err);
        }
    }
}
