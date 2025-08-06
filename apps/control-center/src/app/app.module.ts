import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterOutlet } from '@angular/router';
import { InputMaskModule } from '@ngneat/input-mask';
import { CmdkModule, NavComponent } from '@vality/matez';

import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { NotFoundModule } from './sections/not-found';
import { SidenavInfoComponent } from './shared/components/sidenav-info';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatListModule,
        SidenavInfoComponent,
        NavComponent,
        // TODO: hack for metadata datetime 😡
        MatDatepickerModule,
        // TODO: hack for cash field 😡
        InputMaskModule,
        MatChipsModule,
        MatTooltipModule,
        CmdkModule,
        RouterOutlet,
        NotFoundModule,
    ],
    providers: appConfig.providers,
    bootstrap: [AppComponent],
})
export class AppModule {}
