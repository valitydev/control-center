import { Component, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { first } from 'rxjs/operators';

import { CodeLensProvider, CompletionProvider } from '@cc/components/monaco-editor';

import { DomainMetadataFormExtensionsService } from '../../../shared/services';
import { DomainNavigateService } from '../services/domain-navigate.service';
import { DomainObjModificationService } from '../services/domain-obj-modification.service';
import { ModifiedDomainObjectService } from '../services/modified-domain-object.service';

import { DomainObjCodeLensProvider } from './domain-obj-code-lens-provider';
import { DomainObjCompletionProvider } from './domain-obj-completion-provider';

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
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    object$ = this.domainObjModService.object$;
    type$ = this.domainObjModService.type$;
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private domainObjModService: DomainObjModificationService,
        private modifiedDomainObjectService: ModifiedDomainObjectService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private domainNavigateService: DomainNavigateService,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit() {
        this.domainObjModService.object$
            .pipe(first(), takeUntilDestroyed(this.destroyRef))
            .subscribe((object) => {
                if (
                    this.modifiedDomainObjectService.domainObject &&
                    this.route.snapshot.queryParams.ref === this.modifiedDomainObjectService.ref
                ) {
                    this.control.setValue(this.modifiedDomainObjectService.domainObject);
                } else {
                    this.control.setValue(object);
                }
            });
    }

    reviewChanges() {
        this.modifiedDomainObjectService.update(
            this.control.value,
            this.route.snapshot.queryParams.ref,
        );
        void this.router.navigate(['domain', 'review'], {
            queryParams: { ref: this.route.snapshot.queryParams.ref },
        });
    }

    backToDomain() {
        this.type$.pipe(first()).subscribe((type) => this.domainNavigateService.toType(type));
    }
}
