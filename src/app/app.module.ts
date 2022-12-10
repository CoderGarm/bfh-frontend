import {ChatModule} from './modules/chat/chat.module';
import {ErrorDialogComponent} from './components/error-dialog/error-dialog.component';
import {CustomErrorHandler} from './services/customErrorHandler.service';
import {PasswordEqualityValidatorDirective, PasswordPatternValidatorDirective} from './validators/passwordValidator';
import {AuthenticationModule} from './services/authentication';
import {ErrorHandler, Injector, NgModule, SecurityContext} from '@angular/core';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/user/login/login.component';
import {RegisterComponent} from './components/user/register/register.component';
import {ProfileComponent} from './components/user/profile/profile.component';
import {NavComponent} from './components/nav/nav.component';
import {NgxPermissionsModule} from 'ngx-permissions';
import {HomeComponent} from './components/home/home.component';
import {SharedModuleModule} from "./modules/shared-module/shared-module.module";
import {PlanetsModule} from "./modules/planets/planets.module";
import {StarMapModule} from "./modules/star-map/star-map.module";
import {ResearchModule} from "./modules/research/research.module";
import {ShipClassConstructionModule} from "./modules/ship-class-construction/ship-class-construction.module";
import {FleetModule} from "./modules/fleet/fleet.module";
import {SubscriptionManager} from "./SubscriptionManager";
import {ConfirmDialogComponent} from "./components/confirmation-dialog/confirm-dialog.component";
import {DisplayElementsModule} from "./modules/display-elements/display-elements.module";
import {ExpansionModule} from "./modules/expansion/expansion.module";
import {JournalModule} from "./modules/journal/journal.module";
import {BasicViewHelper} from "./basic-view-helper";
import {SnackbarNotificationService} from "./services/snackbar-notification.service";
import {AdminModule} from "./modules/admin/admin.module";
import {ForumModule} from "./modules/forum/forum.module";
import {EMailValidatorDirective, UserNameValidatorDirective} from "./validators/userNameValidator";
import {AllianceModule} from "./modules/alliance/alliance.module";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HTTP_INTERCEPTORS, HttpClient} from "@angular/common/http";
import {TranslationEditorComponent} from "./modules/admin/components/payload/translation-editor/translation-editor.component";
import {DatePipe} from "@angular/common";
import {GlobalSpinnerComponent} from './components/global-spinner/global-spinner.component';
import {SpinnerService} from "./services/spinner.service";
import {TypeService} from "./services/type.service";
import {NumberShortPipe} from "./services/pipes/number-short.pipe";
import {NumberThousandSeparatorPipe} from "./services/pipes/number-thousand-separator.pipe";
import {HttpCacheInterceptor} from "./services/interceptors/http-cache-interceptor";
import {ResourceDisplayModule} from "./modules/display-elements/modules/resource-display/resource-display.module";
import {WikiModule} from "./modules/wiki/wiki.module";
import {MarkdownModule, MarkdownService} from "ngx-markdown";
import {AngularMarkdownEditorModule} from "angular-markdown-editor";
import {TransportationModule} from "./modules/transportation/transportation.module";
import {BackgroundService} from "./services/background.service";
import {FleetChangeService} from "./services/fleet-change.service";
import {StarMapCommunicationService} from "./star-map-communication.service";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export let AppInjector: Injector;

@NgModule({
    declarations: [
        AppComponent,
        SubscriptionManager,
        BasicViewHelper,
        ErrorDialogComponent,
        NavComponent,
        LoginComponent,
        RegisterComponent,
        ProfileComponent,
        HomeComponent,
        PasswordEqualityValidatorDirective,
        PasswordPatternValidatorDirective,
        UserNameValidatorDirective,
        EMailValidatorDirective,
        ConfirmDialogComponent,
        GlobalSpinnerComponent,
    ],
    imports: [
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
            defaultLanguage: TranslationEditorComponent.DEFAULT_LANGUAGE,
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        AuthenticationModule,
        SharedModuleModule,
        DisplayElementsModule,
        ResourceDisplayModule,
        ChatModule,
        PlanetsModule,
        StarMapModule,
        ResearchModule,
        ShipClassConstructionModule,
        FleetModule,
        ExpansionModule,
        JournalModule,
        AdminModule,
        ForumModule,
        AllianceModule,
        MarkdownModule.forRoot({
            sanitize: SecurityContext.URL
        }),
        AngularMarkdownEditorModule.forRoot(),
        WikiModule,
        TransportationModule,
    ],
    providers: [
        NgxPermissionsModule,
        {provide: ErrorHandler, useClass: CustomErrorHandler},
        {provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true},
        SnackbarNotificationService,
        SpinnerService,
        FleetChangeService,
        TypeService,
        BackgroundService,
        DatePipe,
        NumberShortPipe,
        NumberThousandSeparatorPipe,
        MarkdownService,
        StarMapCommunicationService,
    ],
    exports: [
        MarkdownModule,
        AngularMarkdownEditorModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private injector: Injector) {
        AppInjector = this.injector;
    }
}
