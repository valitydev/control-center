import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { InputFieldModule, TableModule } from '@vality/matez';

import { PageLayoutModule } from '../shared';
import { DomainThriftViewerComponent } from '../shared/components/thrift-api-crud';

import { TerminalsRoutingModule } from './terminals-routing.module';
import { TerminalsComponent } from './terminals.component';

@NgModule({
    declarations: [TerminalsComponent],
    imports: [
        CommonModule,
        TerminalsRoutingModule,
        TableModule,
        MatButtonModule,
        PageLayoutModule,
        InputFieldModule,
        ReactiveFormsModule,
        DomainThriftViewerComponent,
        MatExpansionModule,
    ],
})
export class TerminalsModule {}
