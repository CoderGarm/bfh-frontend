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
import {OverlayModule} from "@angular/cdk/overlay";
import {AngularEditorModule} from "@kolkov/angular-editor";
import {TranslateModule} from "@ngx-translate/core";
import {NumberShortPipe} from "../../services/pipes/number-short.pipe";
import {NumberThousandSeparatorPipe} from "../../services/pipes/number-thousand-separator.pipe";
import {NumberShortComponent} from "./components/number-short/number-short.component";
import {MarkdownModule} from "ngx-markdown";
import {AngularMarkdownEditorModule} from "angular-markdown-editor";

@NgModule({
    declarations: [
        NumericCounterComponent,
        NumberShortComponent,
        NumberShortPipe,
        NumberThousandSeparatorPipe,
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
        OverlayModule,
        AngularEditorModule,
        MarkdownModule.forChild(),
        AngularMarkdownEditorModule,
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
        NumericCounterComponent,
        NumberShortComponent,
        OverlayModule,
        AngularEditorModule,
        TranslateModule,
        NumberShortPipe,
        NumberThousandSeparatorPipe,
        MarkdownModule,
        AngularMarkdownEditorModule,
    ]
})
export class SharedModuleModule {
}
