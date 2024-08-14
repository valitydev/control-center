import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { EventPayload, Event } from '@vality/domain-proto/internal/payment_processing';
import { HumanizedDurationPipe } from '@vality/ng-core';
import { ThriftPipesModule, getUnionValue, getUnionKey } from '@vality/ng-thrift';
import { switchMap, Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { TimelineModule } from '../../../../../components/timeline';
import { InvoicingService } from '../../../../api/payment-processing';
import { PageLayoutModule } from '../../../../shared';
import { DomainThriftViewerComponent } from '../../../../shared/components/thrift-api-crud';
import { PaymentDetailsService } from '../../payment-details.service';

import { TimelineItemHeaderComponent } from './components/timeline-item-header/timeline-item-header.component';

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
    events$: Observable<
        {
            changeType: keyof EventPayload;
            change: ValuesType<EventPayload>[number];
            event: Event;
        }[]
    > = this.payment$.pipe(
        switchMap((payment) => this.invoicingService.GetEvents(payment.invoice_id, {})),
        map((events) =>
            events.flatMap((e) =>
                (getUnionValue(e.payload) || []).map((change) => ({
                    changeType: getUnionKey(e.payload),
                    type: {
                        invoice_changes: 'InvoiceChange',
                        party_changes: 'PartyChange',
                        invoice_template_changes: 'InvoiceTemplateChange',
                        customer_changes: 'CustomerChange',
                    }[getUnionKey(e.payload)],
                    change,
                    event: e,
                })),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private invoicingService: InvoicingService,
    ) {}
}
