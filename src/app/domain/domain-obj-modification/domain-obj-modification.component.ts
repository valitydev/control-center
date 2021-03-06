import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CodeLensProvider, CompletionProvider, MonacoFile } from '../../monaco-editor';
import { DomainModificationModel } from '../domain-modification-model';
import { DomainReviewService } from '../domain-review.service';
import { toMonacoFile } from '../utils';
import { DomainObjCodeLensProvider } from './domain-obj-code-lens-provider';
import { DomainObjCompletionProvider } from './domain-obj-completion-provider';
import { DomainObjModificationService } from './domain-obj-modification.service';
import { ResetConfirmDialogComponent } from './reset-confirm-dialog/reset-confirm-dialog.component';

@Component({
    templateUrl: './domain-obj-modification.component.html',
    styleUrls: ['../editor-container.scss'],
    providers: [DomainObjModificationService],
})
export class DomainObjModificationComponent implements OnInit, OnDestroy {
    initialized = false;
    isLoading: boolean;
    valid = false;
    codeLensProviders: CodeLensProvider[];
    completionProviders: CompletionProvider[];
    modifiedFile: MonacoFile;
    model: DomainModificationModel;

    private initSub: Subscription;

    constructor(
        private router: Router,
        private snackBar: MatSnackBar,
        private domainObjModService: DomainObjModificationService,
        private domainReviewService: DomainReviewService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.initSub = this.initialize();
        this.codeLensProviders = [new DomainObjCodeLensProvider()];
        this.completionProviders = [new DomainObjCompletionProvider()];
    }

    ngOnDestroy() {
        if (this.initSub) {
            this.initSub.unsubscribe();
        }
    }

    fileChange({ content }: MonacoFile) {
        const modified = this.domainObjModService.modify(this.model.original, content);
        this.valid = !!modified;
        this.model.modified = modified;
    }

    reviewChanges() {
        this.domainReviewService.addReviewModel(this.model);
        void this.router.navigate(['domain', JSON.stringify(this.model.ref), 'review']);
    }

    resetChanges() {
        this.dialog
            .open(ResetConfirmDialogComponent, {
                width: '300px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const modified = this.domainObjModService.reset(this.model.original);
                this.model.modified = modified;
                this.modifiedFile = toMonacoFile(modified.monacoContent);
            });
    }

    private initialize(): Subscription {
        this.isLoading = true;
        return this.domainObjModService.init().subscribe(
            (model) => {
                this.isLoading = false;
                this.model = model;
                this.modifiedFile = toMonacoFile(model.modified.monacoContent);
                this.initialized = true;
                if (this.initSub) {
                    this.initSub.unsubscribe();
                }
            },
            (err) => {
                console.error(err);
                this.isLoading = false;
                this.snackBar.open(`An error occurred while initializing: ${String(err)}`, 'OK');
            }
        );
    }
}
