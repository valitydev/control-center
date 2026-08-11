import { filter, shareReplay } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    afterNextRender,
    booleanAttribute,
    inject,
    model,
} from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    FormControlSuperclass,
    UnionEnum,
    createControlProviders,
    getValueChanges,
} from '@vality/matez';
import { ValueType } from '@vality/thrift-ts';

import { ThriftData } from '../../models';
import { ThriftAstMetadata } from '../../types';
import { fromJson } from '../../utils/thrift-type/from-json';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ThriftEditorComponent<T> extends FormControlSuperclass<T> {
    private dialogService = inject(DialogService);
    private injector = inject(Injector);
    readonly kind = model<UnionEnum<EditorKind>>(EditorKind.Form);

    @Input() defaultValue?: T;

    @Input() metadata!: ThriftAstMetadata[];
    @Input() namespace!: string;
    @Input() type!: ValueType;
    @Input() extensions?: ThriftFormExtension[];
    @Input({ transform: booleanAttribute }) noChangeKind = false;
    @Input({ transform: booleanAttribute }) noToolbar = false;

    content$ = getValueChanges(this.control).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    private editorError: unknown = null;

    override validate(control: AbstractControl): ValidationErrors | null {
        if (this.kind() === EditorKind.Editor) {
            return this.editorError ? { jsonParse: this.editorError } : null;
        }
        return super.validate(control);
    }

    setError(error: unknown | null) {
        if (error) {
            this.editorError = error;
        } else {
            this.editorError = null;
        }
        this.control.updateValueAndValidity();
    }

    setEditorValue(value: unknown) {
        this.control.setValue(
            fromJson(value, new ThriftData(this.metadata, this.namespace, this.type)) as T,
        );
    }

    toggleKind() {
        this.editorError = null;
        const kind = this.kind();
        switch (kind) {
            case EditorKind.Editor: {
                const value = this.control.value;
                this.kind.set(EditorKind.Form);
                afterNextRender(
                    () => {
                        if (this.kind() === EditorKind.Form) {
                            this.control.setValue(value);
                        }
                    },
                    { injector: this.injector },
                );
                break;
            }
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
                this.control.reset(this.defaultValue, { emitEvent: true });
                this.setError(null);
            });
    }
}
