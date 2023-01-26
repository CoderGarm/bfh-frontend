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
import {TranslateModule} from "@ngx-translate/core";
import {NumberShortPipe} from "../../services/pipes/number-short.pipe";
import {NumberThousandSeparatorPipe} from "../../services/pipes/number-thousand-separator.pipe";
import {NumberShortComponent} from "./components/number-short/number-short.component";
import {MarkdownModule} from "ngx-markdown";
import {AngularMarkdownEditorModule} from "angular-markdown-editor";
import {ResourceCounterComponent} from "./components/resource-counter/resource-counter.component";
import {HumanResourceCounterComponent} from './components/human-resource-counter/human-resource-counter.component';
import {NumericSliderCounterComponent} from "./components/numeric-slider-counter/numeric-slider-counter.component";
import {AmountShifterComponent} from "./components/amount-shifter/amount-shifter.component";
import {NumberRomanPipe} from "../../services/pipes/number-roman.pipe";
import {MarkdownEditorComponent} from './components/markdown-editor/markdown-editor.component';

@NgModule({
    declarations: [
        NumericCounterComponent,
        NumberShortComponent,
        NumberShortPipe,
        NumberRomanPipe,
        NumberThousandSeparatorPipe,
        ResourceCounterComponent,
        HumanResourceCounterComponent,
        NumericSliderCounterComponent,
        AmountShifterComponent,
        MarkdownEditorComponent,
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
        MarkdownModule.forChild(),
        AngularMarkdownEditorModule,
        TranslateModule,
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
        OverlayModule,
        TranslateModule,
        NumberShortPipe,
        NumberRomanPipe,
        NumberThousandSeparatorPipe,
        MarkdownModule,
        AngularMarkdownEditorModule,
        MaterialComponentsModule,
        NumericCounterComponent,
        NumberShortComponent,
        ResourceCounterComponent,
        HumanResourceCounterComponent,
        NumericSliderCounterComponent,
        AmountShifterComponent,
        MarkdownEditorComponent,
    ]
})
export class SharedModuleModule {
}
