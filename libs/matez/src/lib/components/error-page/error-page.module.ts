import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ErrorPageRoutingModule } from './error-page-routing.module';
import { ErrorPageComponent } from './error-page.component';

@NgModule({
    imports: [ErrorPageRoutingModule, MatIconModule],
    declarations: [ErrorPageComponent],
})
export class ErrorPageModule {}
