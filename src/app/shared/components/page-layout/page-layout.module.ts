import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ActionsModule, TagModule } from '@vality/ng-core';

import { ThriftPipesModule } from '../../pipes';

import { PageLayoutActionsComponent } from './components/page-layout-actions/page-layout-actions.component';
import { PageLayoutComponent } from './page-layout.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
        MatButtonModule,
        MatTooltipModule,
        ActionsModule,
        MatToolbar,
        TagModule,
        ThriftPipesModule,
    ],
    declarations: [PageLayoutComponent, PageLayoutActionsComponent],
    exports: [PageLayoutComponent, PageLayoutActionsComponent],
})
export class PageLayoutModule {}
