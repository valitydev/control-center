import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

@NgModule({
    imports: [RouterModule.forRoot([])],
    providers: [AppAuthGuardService],
    exports: [RouterModule],
})
export class AppRoutingModule {}
