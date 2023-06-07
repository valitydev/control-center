import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PageLayoutActionsComponent } from './components/page-layout-actions/page-layout-actions.component';
import { PageLayoutComponent } from './page-layout.component';

@NgModule({
    imports: [CommonModule, FlexModule, MatIconModule, MatProgressSpinnerModule],
    declarations: [PageLayoutComponent, PageLayoutActionsComponent],
    exports: [PageLayoutComponent, PageLayoutActionsComponent],
})
export class PageLayoutModule {}
