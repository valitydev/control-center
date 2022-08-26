import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { enumHasValue } from '../../../utils';
import { CodeLensProvider, CompletionProvider } from '../../monaco-editor';
import { EditorKind } from '../../shared/components/thrift-editor';
import { DomainMetadataFormExtensionsService } from '../../shared/services';
import { DomainObjModificationService } from '../services/domain-obj-modification.service';
import { ModifiedDomainObjectService } from '../services/modified-domain-object.service';
import { DomainObjCodeLensProvider } from './domain-obj-code-lens-provider';
import { DomainObjCompletionProvider } from './domain-obj-completion-provider';

const EDITOR_KIND = 'domain-obj-modification-kind';

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
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    qp$ = this.type$.pipe(map((type) => JSON.stringify([type])));

    get kind() {
        const kind = localStorage.getItem(EDITOR_KIND);
        if (!enumHasValue(EditorKind, kind)) {
            this.kind = EditorKind.Editor;
            return EditorKind.Editor;
        }
        return kind;
    }
    set kind(kind: EditorKind) {
        localStorage.setItem(EDITOR_KIND, kind);
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private domainObjModService: DomainObjModificationService,
        private modifiedDomainObjectService: ModifiedDomainObjectService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService
    ) {}

    ngOnInit() {
        this.object$.pipe(untilDestroyed(this)).subscribe((object) => {
            this.control.setValue(object);
        });
    }

    reviewChanges() {
        this.modifiedDomainObjectService.update(this.control.value);
        void this.router.navigate(['domain', 'edit', this.route.snapshot.params.ref, 'review']);
    }
}
