import { ElementRef, NgZone } from '@angular/core';
import { ResizeSensor } from 'css-element-queries';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil, tap, first } from 'rxjs/operators';

import { BOOTSTRAP$ } from './bootstrap';
import { fromDisposable } from './from-disposable';
import {
    CodeLensProvider,
    CompletionProvider,
    IDisposable,
    IEditorOptions,
    ITextModel,
    MonacoFile,
} from './model';
import { CodeLensService } from './providers/code-lens.service';
import { CompletionService } from './providers/completion.service';

export abstract class AbstractMonacoService {
    protected _editor: monaco.editor.IEditor;
    private editorInitialized$ = new Subject<void>();
    private fileChange$ = new Subject<MonacoFile>();
    private nativeElement: HTMLElement;
    private destroy$ = new Subject<void>();
    private resizeDetector: ResizeSensor;

    get fileChange(): Observable<MonacoFile> {
        return this.fileChange$.pipe(takeUntil(this.destroy$));
    }

    get editor(): monaco.editor.IEditor {
        return this._editor;
    }

    constructor(
        protected zone: NgZone,
        protected codeLensService: CodeLensService,
        protected completionService: CompletionService,
        protected tokenCodeLensProviders: CodeLensProvider[],
        protected tokenCompletionProviders: CompletionProvider[],
    ) {
        BOOTSTRAP$.pipe(first()).subscribe(() => {
            this.registerCodeLensListener();
            this.registerCompletionListener();
        });
    }

    init({ nativeElement }: ElementRef, options: IEditorOptions = {}): Observable<void> {
        this.nativeElement = nativeElement;
        this.registerResizeListener();
        return BOOTSTRAP$.pipe(
            tap(() => {
                this.disposeModels();
                this._editor = this.createEditor(nativeElement, options);
                this.codeLensService.add(this.tokenCodeLensProviders);
                this.completionService.add(this.tokenCompletionProviders);
                this.openFile();
                this.editorInitialized$.next();
            }),
        );
    }

    destroy() {
        if (this.resizeDetector) this.resizeDetector.detach();
        this.destroy$.next();
    }

    updateOptions(options: IEditorOptions) {
        if (this._editor) {
            this._editor.updateOptions(options);
        }
    }

    addCodeLensProvider(providers: CodeLensProvider[]) {
        this.codeLensService.add(providers);
    }

    codeLensProviderRegistered(): Observable<IDisposable[]> {
        return this.codeLensService.registered.pipe(takeUntil(this.destroy$));
    }

    addCompletionProvider(providers: CompletionProvider[]) {
        this.completionService.add(providers);
    }

    completionProviderRegistered(): Observable<IDisposable[]> {
        return this.completionService.registered.pipe(takeUntil(this.destroy$));
    }

    protected abstract createEditor(
        el: HTMLElement,
        options: IEditorOptions,
    ): monaco.editor.IEditor;

    protected abstract openFile();

    protected prepareModel(file: MonacoFile): ITextModel {
        const uri = monaco.Uri.file(file.uri);
        let model = monaco.editor.getModel(uri);
        if (model) {
            if (file.language && model.getModeId() !== file.language) {
                model.dispose();
                model = undefined;
            } else {
                model.setValue(file.content);
            }
        } else {
            model = monaco.editor.createModel(file.content, file.language, uri);
            this.registerModelChangeListener(file, model);
        }
        return model;
    }

    protected getLayout() {
        return this.nativeElement.getBoundingClientRect();
    }

    private disposeModels() {
        for (const model of monaco.editor.getModels()) {
            model.dispose();
        }
        this.codeLensService.dispose();
        this.completionService.dispose();
    }

    private registerCompletionListener() {
        this.completionService.providers.subscribe((providers) =>
            this.completionService.register(providers),
        );
    }

    private registerCodeLensListener() {
        this.codeLensService.providers.subscribe((providers) =>
            this.codeLensService.register(providers),
        );
    }

    private registerModelChangeListener(file: MonacoFile, model: monaco.editor.IModel) {
        const destroy = fromDisposable(model.onWillDispose.bind(model)).pipe(take(1));
        fromDisposable(model.onDidChangeContent.bind(model))
            .pipe(
                map(() => model.getValue()),
                takeUntil(destroy),
            )
            .subscribe((content: string) =>
                this.zone.run(() =>
                    this.fileChange$.next({
                        ...file,
                        content,
                    }),
                ),
            );
    }

    private registerResizeListener() {
        if (this.resizeDetector) this.resizeDetector.detach();
        this.resizeDetector = new ResizeSensor(this.nativeElement, () => {
            this.updateLayoutSize();
        });
    }

    private updateLayoutSize() {
        this._editor.layout(this.getLayout());
    }
}
