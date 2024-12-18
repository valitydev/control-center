import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NotFoundModule } from './not-found';
import { SectionsRoutingModule } from './sections-routing.module';

@NgModule({
    imports: [
        CommonModule,
        SectionsRoutingModule,
        // It is important that NotFoundModule module should be last
        NotFoundModule,
    ],
})
export class SectionsModule {}
