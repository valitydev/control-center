import { Directive, ElementRef, Input } from '@angular/core';

import { ComponentChanges } from '../shared';
import { AbstractMonacoDirective } from './abstarct-monaco.directive';
import { MonacoFile } from './model';
import { MonacoEditorService } from './monaco-editor.service';

@Directive({
    selector: 'cc-monaco-editor,[ccMonacoEditor]',
})
export class MonacoEditorDirective extends AbstractMonacoDirective {
    @Input() file: MonacoFile;

    constructor(protected editorService: MonacoEditorService, protected editorRef: ElementRef) {
        super(editorService, editorRef);
    }

    childOnChanges({ file }: ComponentChanges<MonacoEditorDirective>) {
        if (file) {
            this.editorService.open(file.currentValue);
        }
    }
}
