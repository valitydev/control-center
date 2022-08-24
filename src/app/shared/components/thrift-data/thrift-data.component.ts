import { Component, Input, Injector } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { BaseDialogService, BaseDialogResponseStatus } from '@vality/ng-core';
import { map, filter, shareReplay } from 'rxjs/operators';

import { ThriftAstMetadata, objectToJSON, thriftInstanceToObject } from '@cc/app/api/utils';
import { toMonacoFile } from '@cc/app/domain/utils';
import { MonacoFile, CodeLensProvider, CompletionProvider } from '@cc/app/monaco-editor';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';
import { ValidatedFormControlSuperclass, createControlProviders } from '@cc/utils';

enum Mode {
    Edit = 'edit',
    Read = 'read',
}

enum Kind {
    Form = 'form',
    Editor = 'editor',
    Diff = 'diff',
}

@UntilDestroy()
@Component({
    selector: 'cc-thrift-data',
    templateUrl: './thrift-data.component.html',
    styleUrls: ['./thrift-data.component.scss'],
    providers: createControlProviders(ThriftDataComponent),
})
export class ThriftDataComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() mode: Mode = Mode.Edit;
    @Input() kind: Kind = Kind.Editor;
    @Input() height: string = '100%';

    @Input() defaultValue?: T;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: string;

    @Input() codeLensProviders: CodeLensProvider[];
    @Input() completionProviders: CompletionProvider[];

    file$ = this.control.value$.pipe(
        map((value) => JSON.stringify(objectToJSON(value), null, 2)),
        filter((content) => content !== this.editorContent$),
        map((content) => toMonacoFile(content)),
        untilDestroyed(this),
        shareReplay(1)
    );

    private editorContent$: string = null;

    constructor(injector: Injector, private baseDialogService: BaseDialogService) {
        super(injector);
    }

    fileChange($event: MonacoFile) {
        this.editorContent$ = $event.content;
        const value: T = thriftInstanceToObject<T>(
            this.metadata,
            this.namespace,
            this.type,
            JSON.parse($event.content)
        );
        this.control.setValue(value);
    }

    toggleKind() {
        switch (this.kind) {
            case Kind.Editor:
                this.kind = Kind.Form;
                return;
            case Kind.Form:
                this.kind = Kind.Editor;
                return;
        }
    }

    reset() {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Reset changes' })
            .afterClosed()
            .pipe(filter(({ status }) => status === BaseDialogResponseStatus.Success))
            .subscribe(() => {
                this.control.reset(this.defaultValue);
            });
    }
}
