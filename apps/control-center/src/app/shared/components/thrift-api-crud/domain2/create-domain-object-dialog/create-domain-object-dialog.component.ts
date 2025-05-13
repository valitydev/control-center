import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ReflessDomainObject } from '@vality/domain-proto/domain';
import {
    DEFAULT_DIALOG_CONFIG,
    DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    DialogConfig,
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    progressTo,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { BehaviorSubject } from 'rxjs';
import { ValuesType } from 'utility-types';

import { DomainService } from '../../../../../api/domain-config';
import { APP_ROUTES } from '../../../../../app-routes';
import { NavigateService } from '../../../../services';
import { DomainThriftFormComponent } from '../../domain/domain-thrift-form';
import { DomainThriftViewerComponent } from '../../domain/domain-thrift-viewer';

@Component({
    selector: 'cc-create-domain-object-dialog',
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        DomainThriftViewerComponent,
    ],
    templateUrl: './create-domain-object-dialog.component.html',
})
export class CreateDomainObjectDialogComponent
    extends DialogSuperclass<
        CreateDomainObjectDialogComponent,
        { objectType?: keyof ReflessDomainObject } | void
    >
    implements OnInit
{
    static override defaultDialogConfig: ValuesType<DialogConfig> = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

    control = new FormControl<ReflessDomainObject | null>(null, [Validators.required]);
    progress$ = new BehaviorSubject(0);
    isReview = false;

    constructor(
        private domainService: DomainService,
        private destroyRef: DestroyRef,
        private log: NotifyLogService,
        private navigateService: NavigateService,
    ) {
        super();
    }

    ngOnInit() {
        if (this.dialogData && this.dialogData.objectType) {
            this.control.setValue({ [this.dialogData.objectType]: {} });
        }
    }

    create() {
        this.domainService
            .insert([this.control.value])
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.log.successOperation('create', 'domain object');
                void this.navigateService.navigate(APP_ROUTES.domain2.root, {
                    type: getUnionKey(this.control.value),
                });
                this.closeWithSuccess();
            });
    }
}
