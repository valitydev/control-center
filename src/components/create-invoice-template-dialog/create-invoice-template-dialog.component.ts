import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { InvoiceTemplateCreateParams } from '@vality/domain-proto/api_extensions';
import { DialogModule, DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';

import { ThriftInvoiceTemplatingService } from '~/api/services';

import { DomainThriftFormComponent } from '../thrift-api-crud';

@Component({
    templateUrl: './create-invoice-template-dialog.component.html',
    imports: [DialogModule, DomainThriftFormComponent, ReactiveFormsModule, MatButtonModule],
})
export class CreateInvoiceTemplateDialogComponent extends DialogSuperclass<CreateInvoiceTemplateDialogComponent> {
    private invoiceTemplatingService = inject(ThriftInvoiceTemplatingService);
    private log = inject(NotifyLogService);
    private dr = inject(DestroyRef);

    control = new FormControl<InvoiceTemplateCreateParams>(null, { nonNullable: true });
    progress = signal(0);

    create() {
        this.invoiceTemplatingService
            .Create(this.control.value)
            .pipe(progressTo(this.progress), takeUntilDestroyed(this.dr))
            .subscribe({
                next: () => {
                    this.log.success('Invoice template created');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error('Failed to create invoice template', err);
                },
            });
    }
}
