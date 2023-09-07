import {ChatModule} from './modules/chat/chat.module';
import {ErrorDialogComponent} from './components/error-dialog/error-dialog.component';
import {CustomErrorHandler} from './services/custom-error-handler.service';
import {PasswordEqualityValidatorDirective, PasswordPatternValidatorDirective} from './validators/password.validator';
import {AuthenticationModule} from './services/authentication';
import {CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, Injector, NgModule, SecurityContext} from '@angular/core';
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
import {SubscriptionManager} from "./subscription.manager";
import {ConfirmDialogComponent} from "./components/confirmation-dialog/confirm-dialog.component";
import {DisplayElementsModule} from "./modules/display-elements/display-elements.module";
import {ExpansionModule} from "./modules/expansion/expansion.module";
import {JournalModule} from "./modules/journal/journal.module";
import {BasicViewHelper} from "./services/svg-view-helper/basic-view-helper";
import {SnackbarNotificationService} from "./services/snackbar-notification.service";
import {AdminModule} from "./modules/admin/admin.module";
import {ForumModule} from "./modules/forum/forum.module";
import {UsernamePatternValidatorDirective, UserNameValidatorDirective} from "./validators/username.validator";
import {AllianceModule} from "./modules/alliance/alliance.module";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HTTP_INTERCEPTORS, HttpClient} from "@angular/common/http";
import {TranslationEditorComponent} from "./modules/admin/components/payload/translation-editor/translation-editor.component";
import {DatePipe, NgOptimizedImage} from "@angular/common";
import {SpinnerService} from "./services/spinner.service";
import {TypeService} from "./services/type.service";
import {NumberShortPipe} from "./services/pipes/number-short.pipe";
import {NumberThousandSeparatorPipe} from "./services/pipes/number-thousand-separator.pipe";
import {HttpCacheInterceptor} from "./services/interceptors/http-cache-interceptor";
import {WikiModule} from "./modules/wiki/wiki.module";
import {MarkdownModule, MarkdownService} from "ngx-markdown";
import {AngularMarkdownEditorModule} from "angular-markdown-editor";
import {TransportationModule} from "./modules/transportation/transportation.module";
import {BackgroundService} from "./services/prefetch/background.service";
import {FleetEventService} from "./services/intercom/fleet-event.service";
import {StarMapCommunicationService} from "./services/intercom/star-map-communication.service";
import {NumberRomanPipe} from "./services/pipes/number-roman.pipe";
import {BasicViewHelperData} from "./services/svg-view-helper/basic-view-helper-data";
import {NestedSidenavComponent} from './components/nested-sidenav/nested-sidenav.component';
import {NavigationCommunicationService} from "./services/navigation/navigation-communication.service";
import {SidenavSelectionManager} from "./sidenav-selection-manager";
import {ModuleService} from "./services/prefetch/module.service";
import {DistancePipe} from "./services/pipes/distance.pipe";
import {TechLevelPipe} from "./services/pipes/tech-level.pipe";
import {EMailValidatorDirective} from "./validators/email.validator";
import {ForgottenPasswordComponent} from './components/user/forgotten-password/forgotten-password.component';
import {AccelerationPipe} from "./services/pipes/acceleration.pipe";
import {VelocityPipe} from "./services/pipes/velocity.pipe";
import {TimePipe} from "./services/pipes/time.pipe";
import {MissileEndurancePipe} from "./services/pipes/missile-endurance.pipe";
import {MassPipe} from "./services/pipes/mass.pipe";
import {SafePipe} from "./services/pipes/safe.pipe";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {ColorPickerModule} from "ngx-color-picker";
import {PlayerModule} from "./modules/user-points/player.module";
import {MonitorInterceptor} from "./services/interceptors/monitor.interceptor";
import {DoNotScrollService} from "./services/intercom/do-not-scroll.service";
import {NgxEchartsModule} from "ngx-echarts";
import {CurrentTickService} from "./services/intercom/current-tick.service";
import {AssetsService} from "./services/assets/assets.service";
import {NgxSpinnerModule} from "ngx-spinner";
import {StrategicOperationsModule} from "./modules/strategic-operations/strategic-operations.module";
import {MissionCommunicationService} from "./services/intercom/mission-communication.service";
import {SafeUrlPipe} from "./services/pipes/safe-url.pipe";
import {MapDataProvider} from "./modules/strategic-operations/payload/mission-map/map-data-provider.component";
import {MapData} from "./modules/strategic-operations/payload/mission-map/map-data.component";
import {TakeATourComponent} from './components/take-a-tour/take-a-tour.component';
import {ContributeCreditsComponent} from './components/contribute-credits/contribute-credits.component';
import {TutorialScopeService} from "./modules/tutorial/tutorial-scope.service";
import {TutorialModule} from "./modules/tutorial/tutorial.module";
import {ImprintComponent} from './components/imprint/imprint.component';
import {ScreenSizeWarningComponent} from './components/screen-size-warning/screen-size-warning.component';

// AoT requires an exported function for factories
// noinspection JSUnusedGlobalSymbols
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
        SidenavSelectionManager,
        BasicViewHelperData,
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
        UsernamePatternValidatorDirective,
        EMailValidatorDirective,
        ConfirmDialogComponent,
        NestedSidenavComponent,
        ForgottenPasswordComponent,
        MapData,
        MapDataProvider,
        TakeATourComponent,
        ContributeCreditsComponent,
        ImprintComponent,
        ScreenSizeWarningComponent,
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
        PlayerModule,
        MarkdownModule.forRoot({
            sanitize: SecurityContext.URL
        }),
        AngularMarkdownEditorModule.forRoot(),
        WikiModule,
        TransportationModule,
        TutorialModule,
        ClipboardModule,
        ColorPickerModule,
        NgxEchartsModule.forRoot({
            echarts: () => import('echarts')
        }),
        NgxSpinnerModule,
        NgxSpinnerModule.forRoot({type: 'ball-scale-multiple'}),
        StrategicOperationsModule,
        NgOptimizedImage,
    ],
    providers: [
        NgxPermissionsModule,
        {provide: ErrorHandler, useClass: CustomErrorHandler},
        {provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: MonitorInterceptor, multi: true},
        NavigationCommunicationService,
        TutorialScopeService,
        SnackbarNotificationService,
        SpinnerService,
        DoNotScrollService,
        FleetEventService,
        CurrentTickService,
        TypeService,
        ModuleService,
        BackgroundService,
        DatePipe,
        NumberShortPipe,
        MissileEndurancePipe,
        TimePipe,
        DistancePipe,
        MassPipe,
        AccelerationPipe,
        VelocityPipe,
        TechLevelPipe,
        NumberRomanPipe,
        NumberThousandSeparatorPipe,
        SafePipe,
        SafeUrlPipe,
        MarkdownService,
        StarMapCommunicationService,
        AssetsService,
        MissionCommunicationService,
    ],
    exports: [
        MarkdownModule,
        AngularMarkdownEditorModule,
        ConfirmDialogComponent,
        ClipboardModule,
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
    constructor(private injector: Injector) {
        AppInjector = this.injector;
    }
}
