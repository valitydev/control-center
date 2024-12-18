import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { HumanizedDurationPipe } from '@vality/ng-core';
import { ThriftPipesModule } from '@vality/ng-thrift';
import { switchMap } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { TimelineModule } from '../../../../../components/timeline';
import { InvoicingService } from '../../../../api/payment-processing';
import { PageLayoutModule } from '../../../../shared';
import { DomainThriftViewerComponent } from '../../../../shared/components/thrift-api-crud';
import { PaymentDetailsService } from '../../payment-details.service';

import { TimelineItemHeaderComponent } from './components/timeline-item-header/timeline-item-header.component';
import { getInvoiceChangeInfo } from './utils/get-invoice-change-info';

@Component({
    selector: 'cc-payment-events',
    standalone: true,
    imports: [
        CommonModule,
        PageLayoutModule,
        TimelineModule,
        MatIcon,
        HumanizedDurationPipe,
        ThriftPipesModule,
        DomainThriftViewerComponent,
        MatExpansionModule,
        TimelineItemHeaderComponent,
    ],
    templateUrl: './payment-events.component.html',
    styles: ``,
})
export class PaymentEventsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    events$ = this.payment$.pipe(
        switchMap((payment) => this.invoicingService.GetEvents(payment.invoice_id, {})),
        map((events) =>
            events.flatMap((e) =>
                (e.payload.invoice_changes || []).map((change) => getInvoiceChangeInfo(e, change)),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private invoicingService: InvoicingService,
    ) {}
}
