import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeRu from '@angular/common/locales/ru';
import { LOCALE_ID, NgModule, inject, provideAppInitializer } from '@angular/core';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputMaskModule } from '@ngneat/input-mask';
import { Deanonimus } from '@vality/deanonimus-proto/deanonimus';
import { Repository as OldRepository } from '@vality/domain-proto/domain_config';
import {
    AuthorManagement,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { Invoicing, PartyManagement } from '@vality/domain-proto/payment_processing';
import { DominatorService } from '@vality/dominator-proto/dominator';
import { Automaton } from '@vality/machinegun-proto/state_processing';
import { MerchantStatisticsService } from '@vality/magista-proto/magista';
import { NavComponent, QUERY_PARAMS_SERIALIZERS } from '@vality/matez';
import { MonacoEditorModule } from '@vality/ng-thrift';
import { RepairManagement } from '@vality/repairer-proto/repairer';
import { AccountService } from '@vality/scrooge-proto/account_balance';
import { KeycloakService } from 'keycloak-angular';

import { ToolbarComponent } from '../components';
import { ConfigService } from '../services';
import { provideThriftServices } from '../utils';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializer } from './initializer';
import { SearchPartiesModule } from './sections/search-parties/search-parties.module';
import { SectionsModule } from './sections/sections.module';
import { CandidateCardComponent } from './shared/components/candidate-card/candidate-card.component';
import { ShopCardComponent } from './shared/components/shop-card/shop-card.component';
import { ShopContractCardComponent } from './shared/components/shop-contract-card/shop-contract-card.component';
import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponent } from './shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from './shared/components/terminal-delegates-card/terminal-delegates-card.component';
import { DomainObjectCardComponent } from './shared/components/thrift-api-crud/domain2';
import { KeycloakTokenInfoModule } from './shared/services';
import {
    DATE_RANGE_DAYS,
    DEBOUNCE_TIME_MS,
    DEFAULT_DATE_RANGE_DAYS,
    DEFAULT_DEBOUNCE_TIME_MS,
    DEFAULT_MAT_DATE_FORMATS,
    DEFAULT_QUERY_PARAMS_SERIALIZERS,
} from './tokens';

registerLocaleData(localeRu);

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatListModule,
        SearchPartiesModule,
        KeycloakTokenInfoModule,
        SectionsModule,
        SidenavInfoComponent,
        ToolbarComponent,
        NavComponent,
        MonacoEditorModule.forRoot({
            requireConfig: {
                paths: {
                    // TODO: https://github.com/microsoft/monaco-editor/issues/4778
                    vs: window.location.origin + '/assets/monaco/min/vs',
                },
            },
        }),
        // TODO: hack for metadata datetime 😡
        MatDatepickerModule,
        // TODO: hack for cash field 😡
        InputMaskModule,
    ],
    providers: [
        ConfigService,
        KeycloakService,
        provideAppInitializer(() => {
            const initializerFn = initializer(inject(KeycloakService), inject(ConfigService));
            return initializerFn();
        }),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: MAT_DATE_FORMATS, useValue: DEFAULT_MAT_DATE_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: LOCALE_ID, useValue: 'ru' },
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
        provideThriftServices([
            { service: RepairManagement, name: 'RepairManagement' },
            { service: Deanonimus, name: 'Deanonimus' },
            { service: AccountService, name: 'Scrooge' },
            { service: MerchantStatisticsService, name: 'MerchantStatistics' },
            { service: DominatorService, name: 'Dominator' },
            { service: Automaton, name: 'Automaton' },
            { service: Invoicing, name: 'Invoicing' },
            { service: PartyManagement, name: 'PartyManagement' },
            { service: Repository, name: 'DMT' },
            { service: RepositoryClient, name: 'DMTClient' },
            { service: AuthorManagement, name: 'DMTAuthor' },
            { service: OldRepository, name: 'Domain' },
        ]),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private matIconRegistry: MatIconRegistry) {
        this.registerIcons();
    }

    registerIcons(): void {
        this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    }
}
