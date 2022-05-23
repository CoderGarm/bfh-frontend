import {ChatModule} from './modules/chat/chat.module';
import {ErrorDialogComponent} from './components/error-dialog/error-dialog.component';
import {CustomErrorHandler} from './services/customErrorHandler.service';
import {PasswordEqualityValidatorDirective, PasswordPatternValidatorDirective} from './validators/passwordValidator';
import {AuthenticationModule} from './services/authentication';
import {ErrorHandler, NgModule} from '@angular/core';
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
        ConfirmDialogComponent,
    ],
    imports: [
        NgxPermissionsModule.forRoot(),
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
    ],
    providers: [NgxPermissionsModule,
        {provide: ErrorHandler, useClass: CustomErrorHandler},
        SnackbarNotificationService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
