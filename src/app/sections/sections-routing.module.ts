import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const ROUTES: Routes = [
    {
        path: 'withdrawals-routing-rules',
        loadChildren: () =>
            import('./withdrawals-routing-rules').then((m) => m.WithdrawalsRoutingRulesModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SectionsRoutingModule {}
