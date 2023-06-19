import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { PageLayoutActionsComponent } from './components/page-layout-actions/page-layout-actions.component';
import { PageLayoutComponent } from './page-layout.component';

@NgModule({
    imports: [
        CommonModule,
        FlexModule,
        MatIconModule,
        MatProgressSpinnerModule,
        GridModule,
        RouterLink,
        MatButtonModule,
        MatTooltipModule,
    ],
    declarations: [PageLayoutComponent, PageLayoutActionsComponent],
    exports: [PageLayoutComponent, PageLayoutActionsComponent],
})
export class PageLayoutModule {}
