import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { CustomErrorHandler } from './services/customErrorHandler.service';
import { ApiModule } from './services/swagger/api.module';
import { PasswordPatternValidatorDirective, PasswordEqualityValidatorDirective } from './validators/passwordValidator';
import { AuthenticationModule } from './services/authentication/authentication.module';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/user/login/login.component';
import { RegisterComponent } from './components/user/register/register.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { NavComponent } from './components/nav/nav.component';
import { MaterialComponentsModule } from './modules/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';

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
    PasswordPatternValidatorDirective
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPermissionsModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialComponentsModule,
    AuthenticationModule,
    ApiModule
  ],
  providers: [NgxPermissionsModule, {provide: ErrorHandler, useClass: CustomErrorHandler}],
  //entryComponents: [ErrorDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
