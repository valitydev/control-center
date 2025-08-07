import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './error-page.component';

const ROUTES: Routes = [{ path: '', component: ErrorPageComponent }];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ErrorPageRoutingModule {}
