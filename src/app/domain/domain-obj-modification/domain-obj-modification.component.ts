import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { from } from 'rxjs';

import { MetadataService } from '@cc/app/domain/metadata.service';

import { CodeLensProvider, CompletionProvider } from '../../monaco-editor';
import { DomainReviewService } from '../domain-review.service';
import { DomainObjCodeLensProvider } from './domain-obj-code-lens-provider';
import { DomainObjCompletionProvider } from './domain-obj-completion-provider';
import { DomainObjModificationService } from './domain-obj-modification.service';

@UntilDestroy()
@Component({
    templateUrl: './domain-obj-modification.component.html',
    styleUrls: ['../editor-container.scss'],
    providers: [DomainObjModificationService],
})
export class DomainObjModificationComponent implements OnInit {
    control = new FormControl();

    progress$ = this.domainObjModService.progress$;
    codeLensProviders: CodeLensProvider[] = [new DomainObjCodeLensProvider()];
    completionProviders: CompletionProvider[] = [new DomainObjCompletionProvider()];
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    object$ = this.domainObjModService.object$;
    type$ = this.domainObjModService.type$;

    constructor(
        private router: Router,
        private snackBar: MatSnackBar,
        private domainObjModService: DomainObjModificationService,
        private domainReviewService: DomainReviewService,
        private metadataService: MetadataService
    ) {}

    ngOnInit() {
        this.object$.pipe(untilDestroyed(this)).subscribe((object) => {
            this.control.setValue(object);
        });
    }

    reviewChanges() {
        // this.domainReviewService.addReviewModel(this.model);
        // void this.router.navigate(['domain', JSON.stringify(this.model.ref), 'review']);
    }
}
