import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/domain-proto';
import {
    DialogService,
    DialogResponseStatus,
    ConfirmDialogComponent,
    createControlProviders,
} from '@vality/ng-core';
import { merge, defer, of, Subject } from 'rxjs';
import { map, filter, shareReplay } from 'rxjs/operators';

import { ValidatedFormControlSuperclass } from '@cc/utils';
import { objectToJSON } from '@cc/utils/thrift-instance';

import { MetadataFormExtension } from '../metadata-form';

export enum EditorKind {
    Form = 'form',
    Editor = 'editor',
}

@Component({
    selector: 'cc-thrift-editor',
    templateUrl: './thrift-editor.component.html',
    styleUrls: ['./thrift-editor.component.scss'],
    providers: createControlProviders(() => ThriftEditorComponent),
})
export class ThriftEditorComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() kind: EditorKind = EditorKind.Form;

    @Input() defaultValue?: T;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: string;
    @Input() extensions: MetadataFormExtension[];

    @Output() changeKind = new EventEmitter<EditorKind>();

    content$ = merge(
        this.control.valueChanges.pipe(filter(() => this.kind !== EditorKind.Editor)),
        defer(() => of(this.control.value)),
        defer(() => this.updateFile$),
    ).pipe(
        map((value) => this.createMonacoContent(value)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private updateFile$ = new Subject<void>();
    private editorError: unknown = null;

    constructor(private dialogService: DialogService) {
        super();
    }

    validate(): ValidationErrors | null {
        if (this.kind === EditorKind.Editor) {
            return this.editorError ? { jsonParse: this.editorError } : null;
        }
        return super.validate();
    }

    contentChange(str: string) {
        try {
            this.editorError = null;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const parsed = JSON.parse(str);
            this.control.setValue(parsed as T);
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
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Reset changes' })
            .afterClosed()
            .pipe(filter(({ status }) => status === DialogResponseStatus.Success))
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
