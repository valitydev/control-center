import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PageLayoutActionsComponent } from './components/page-layout-actions/page-layout-actions.component';
import { PageLayoutComponent } from './page-layout.component';

@NgModule({
    imports: [CommonModule],
    declarations: [PageLayoutComponent, PageLayoutActionsComponent],
    exports: [PageLayoutComponent, PageLayoutActionsComponent],
})
export class PageLayoutModule {}
