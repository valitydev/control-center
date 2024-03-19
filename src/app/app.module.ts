import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { LOCALE_ID, NgModule, Injector } from '@angular/core';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputMaskModule } from '@ngneat/input-mask';
import { NavComponent, QUERY_PARAMS_SERIALIZERS } from '@vality/ng-core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { KeycloakTokenInfoModule } from '@cc/app/shared/services';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './core/components/toolbar/toolbar.component';
import { CoreModule } from './core/core.module';
import icons from './icons.json';
import { ClaimsModule } from './sections/claims/claims.module';
import { PayoutsModule } from './sections/payouts';
import { SearchPartiesModule } from './sections/search-parties/search-parties.module';
import { SectionsModule } from './sections/sections.module';
import { CandidateCardComponent } from './shared/components/candidate-card/candidate-card.component';
import { ShopCardComponent } from './shared/components/shop-card/shop-card.component';
import { ShopContractCardComponent } from './shared/components/shop-contract-card/shop-contract-card.component';
import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponent } from './shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from './shared/components/terminal-delegates-card/terminal-delegates-card.component';
import { DomainObjectCardComponent } from './shared/components/thrift-api-crud';
import {
    DEFAULT_MAT_DATE_FORMATS,
    DEFAULT_QUERY_PARAMS_SERIALIZERS,
    DEFAULT_SMALL_SEARCH_LIMIT,
    SMALL_SEARCH_LIMIT,
    DATE_RANGE_DAYS,
    DEFAULT_DATE_RANGE_DAYS,
    DEBOUNCE_TIME_MS,
    DEFAULT_DEBOUNCE_TIME_MS,
} from './tokens';

registerLocaleData(localeRu);

// Do not use in code! Only for extending windows methods
/* eslint-disable @typescript-eslint/naming-convention */
/** @internal */
export let AppInjector: Injector;
/* eslint-enable @typescript-eslint/naming-convention */

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        CoreModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatListModule,
        SearchPartiesModule,
        ClaimsModule,
        KeycloakTokenInfoModule,
        PayoutsModule,
        SectionsModule,
        SidenavInfoComponent,
        ToolbarComponent,
        NavComponent,
        MonacoEditorModule.forRoot(),
        // TODO: hack for metadata datetime 😡
        MatDatepickerModule,
        // TODO: hack for cash field 😡
        InputMaskModule,
    ],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DEFAULT_MAT_DATE_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: LOCALE_ID, useValue: 'ru' },
        { provide: SMALL_SEARCH_LIMIT, useValue: DEFAULT_SMALL_SEARCH_LIMIT },
        { provide: QUERY_PARAMS_SERIALIZERS, useValue: DEFAULT_QUERY_PARAMS_SERIALIZERS },
        { provide: DATE_RANGE_DAYS, useValue: DEFAULT_DATE_RANGE_DAYS },
        { provide: DEBOUNCE_TIME_MS, useValue: DEFAULT_DEBOUNCE_TIME_MS },
        {
            provide: SIDENAV_INFO_COMPONENTS,
            useValue: {
                domainObject: DomainObjectCardComponent,
                shop: ShopCardComponent,
                shopContract: ShopContractCardComponent,
                terminalDelegates: TerminalDelegatesCardComponent,
                candidate: CandidateCardComponent,
            },
        },
        MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private injector: Injector,
    ) {
        this.registerIcons();
        AppInjector = this.injector;
    }

    registerIcons(): void {
        for (const name of icons) {
            this.matIconRegistry.addSvgIcon(
                name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(`../assets/icons/${name}.svg`),
            );
        }
    }
}
