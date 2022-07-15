import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { TableModule } from '../../../components/table';
import { DateRangeModule } from '../../shared/components/date-range/date-range.module';
import { RepairingRoutingModule } from './repairing-routing.module';
import { RepairingComponent } from './repairing.component';

@NgModule({
    imports: [
        CommonModule,
        RepairingRoutingModule,
        TableModule,
        MatCardModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatProgressBarModule,
        MatButtonModule,
        EmptySearchResultModule,
        MatTableModule,
        MatTooltipModule,
        MatBadgeModule,
        MatFormFieldModule,
        MatInputModule,
        DateRangeModule,
        MatSelectModule,
    ],
    declarations: [RepairingComponent],
})
export class RepairingModule {}
