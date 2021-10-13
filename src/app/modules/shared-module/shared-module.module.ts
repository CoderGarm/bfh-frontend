import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialComponentsModule} from "./material.module";
import {HttpClientModule} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppRoutingModule} from "../../app-routing.module";
import {AuthenticationModule} from "../../services/authentication";
import {ApiModule} from "../../services/swagger";
import {NumericCounterComponent} from './components/numeric-counter/numeric-counter.component';


@NgModule({
    declarations: [
        NumericCounterComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        AuthenticationModule,
        ApiModule,
        MaterialComponentsModule,
    ],
    exports: [
        CommonModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        AuthenticationModule,
        ApiModule,
        MaterialComponentsModule,
        NumericCounterComponent
    ]
})
export class SharedModuleModule {
}
