import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const ROUTES: Routes = [
    {
        path: 'party',
        loadChildren: () => import('./party/party.module').then((m) => m.PartyModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SectionsRoutingModule {}
