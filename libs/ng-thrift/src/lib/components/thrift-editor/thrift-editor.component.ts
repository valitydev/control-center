import { Component, Input, booleanAttribute, model } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    FormControlSuperclass,
    UnionEnum,
    createControlProviders,
} from '@vality/matez';
import { ValueType } from '@vality/thrift-ts';
import { Subject, defer, merge, of } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

import { ThriftAstMetadata } from '../../types';
import { toJson } from '../../utils';

import { ThriftFormExtension } from './types/thrift-form-extension';

export enum EditorKind {
    Form = 'form',
    Editor = 'editor',
}

@Component({
    selector: 'v-thrift-editor',
    templateUrl: './thrift-editor.component.html',
    styleUrls: ['./thrift-editor.component.scss'],
    providers: createControlProviders(() => ThriftEditorComponent),
    standalone: false,
})
export class ThriftEditorComponent<T> extends FormControlSuperclass<T> {
    readonly kind = model<UnionEnum<EditorKind>>(EditorKind.Form);

    @Input() defaultValue?: T;

    @Input() metadata!: ThriftAstMetadata[];
    @Input() namespace!: string;
    @Input() type!: ValueType;
    @Input() extensions?: ThriftFormExtension[];
    @Input({ transform: booleanAttribute }) noChangeKind = false;
    @Input({ transform: booleanAttribute }) noToolbar = false;

    content$ = merge(
        this.control.valueChanges.pipe(filter(() => this.kind() !== EditorKind.Editor)),
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

    override validate(control: AbstractControl): ValidationErrors | null {
        if (this.kind() === EditorKind.Editor) {
            return this.editorError ? { jsonParse: this.editorError } : null;
        }
        return super.validate(control);
    }

    contentChange(str: string) {
        try {
            this.editorError = null;
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
        const kind = this.kind();
        switch (kind) {
            case EditorKind.Editor:
                this.kind.set(EditorKind.Form);
                break;
            case EditorKind.Form:
                this.kind.set(EditorKind.Editor);
                break;
        }
    }

    reset() {
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Reset changes' })
            .afterClosed()
            .pipe(filter((res) => res?.status === DialogResponseStatus.Success))
            .subscribe(() => {
                this.control.reset(this.defaultValue);
                this.editorError = null;
                this.updateFile$.next();
            });
    }

    private createMonacoContent(value: unknown): string {
        return JSON.stringify(toJson(value), null, 2);
    }
}
