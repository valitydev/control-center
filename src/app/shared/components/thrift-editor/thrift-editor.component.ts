import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { BaseDialogService, BaseDialogResponseStatus } from '@vality/ng-core';
import { merge, defer, of, Subject } from 'rxjs';
import { map, filter, shareReplay } from 'rxjs/operators';

import { ThriftAstMetadata, thriftInstanceToObject, objectToJSON } from '@cc/app/api/utils';
import { toMonacoFile } from '@cc/app/sections/domain/utils';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';
import { MonacoFile, CodeLensProvider, CompletionProvider } from '@cc/components/monaco-editor';
import { ValidatedFormControlSuperclass, createControlProviders } from '@cc/utils';

import { MetadataFormExtension } from '../metadata-form';

export enum EditorKind {
    Form = 'form',
    Editor = 'editor',
}

@Component({
    selector: 'cc-thrift-editor',
    templateUrl: './thrift-editor.component.html',
    styleUrls: ['./thrift-editor.component.scss'],
    providers: createControlProviders(ThriftEditorComponent),
})
export class ThriftEditorComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() kind: EditorKind = EditorKind.Editor;

    @Input() defaultValue?: T;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: string;
    @Input() extensions: MetadataFormExtension[];

    @Input() codeLensProviders: CodeLensProvider[];
    @Input() completionProviders: CompletionProvider[];

    @Output() changeKind = new EventEmitter<EditorKind>();

    file$ = merge(
        this.control.value$.pipe(filter(() => this.kind !== EditorKind.Editor)),
        defer(() => of(this.control.value)),
        defer(() => this.updateFile$)
    ).pipe(
        map((value) => toMonacoFile(this.createMonacoContent(value))),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    private updateFile$ = new Subject<void>();
    private editorContent: string = null;
    private editorError: unknown = null;

    constructor(private baseDialogService: BaseDialogService) {
        super();
    }

    validate(): ValidationErrors | null {
        if (this.kind === EditorKind.Editor) {
            return this.editorError ? { jsonParse: this.editorError } : null;
        }
        return super.validate();
    }

    fileChange($event: MonacoFile) {
        this.editorContent = $event.content;
        try {
            const value: T = thriftInstanceToObject<T>(
                this.metadata,
                this.namespace,
                this.type,
                JSON.parse($event.content)
            );
            this.editorError = null;
            this.control.setValue(value);
        } catch (err) {
            console.warn(err);
            this.editorError = err;
            this.control.updateValueAndValidity();
        }
    }

    toggleKind() {
        this.editorError = null;
        switch (this.kind) {
            case EditorKind.Editor:
                this.kind = EditorKind.Form;
                break;
            case EditorKind.Form:
                this.kind = EditorKind.Editor;
                break;
        }
        this.changeKind.emit(this.kind);
    }

    reset() {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Reset changes' })
            .afterClosed()
            .pipe(filter(({ status }) => status === BaseDialogResponseStatus.Success))
            .subscribe(() => {
                this.control.reset(this.defaultValue);
                this.editorError = null;
                this.updateFile$.next();
            });
    }

    private createMonacoContent(value: unknown): string {
        return JSON.stringify(objectToJSON(value), null, 2);
    }
}
