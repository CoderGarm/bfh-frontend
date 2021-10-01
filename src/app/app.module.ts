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

@NgModule({
    declarations: [
        AppComponent,
        ErrorDialogComponent,
        NavComponent,
        LoginComponent,
        RegisterComponent,
        ProfileComponent,
        HomeComponent,
        PasswordEqualityValidatorDirective,
        PasswordPatternValidatorDirective,
    ],
    imports: [
        NgxPermissionsModule.forRoot(),
        AuthenticationModule,
        SharedModuleModule,
        ChatModule,
        PlanetsModule,
        StarMapModule,
    ],
    providers: [NgxPermissionsModule, {provide: ErrorHandler, useClass: CustomErrorHandler}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
