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
import {NumericSliderCounterComponent} from "./components/numeric-slider-counter/numeric-slider-counter.component";
import {AmountShifterComponent} from "./components/amount-shifter/amount-shifter.component";
import {NumberRomanPipe} from "../../services/pipes/number-roman.pipe";
import {MarkdownEditorComponent} from './components/markdown-editor/markdown-editor.component';
import {OutlinedComponent} from './components/outlined/outlined.component';
import {ChipSelectorComponent} from "./components/chip-selector/chip-selector.component";
import {DistancePipe} from "../../services/pipes/distance.pipe";
import {TechLevelPipe} from "../../services/pipes/tech-level.pipe";
import {AccelerationPipe} from "../../services/pipes/acceleration.pipe";
import {VelocityPipe} from "../../services/pipes/velocity.pipe";
import {TimePipe} from "../../services/pipes/time.pipe";
import {MissileEndurancePipe} from "../../services/pipes/missile-endurance.pipe";
import {MassPipe} from "../../services/pipes/mass.pipe";
import {SafePipe} from "../../services/pipes/safe.pipe";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {ColorPickerModule} from "ngx-color-picker";
import {SafeUrlPipe} from "../../services/pipes/safe-url.pipe";
import {IconComponent} from "./components/icon/icon.component";

@NgModule({
    declarations: [
        NumericCounterComponent,
        NumberShortComponent,
        NumberShortPipe,
        TimePipe,
        DistancePipe,
        MassPipe,
        MissileEndurancePipe,
        AccelerationPipe,
        VelocityPipe,
        TechLevelPipe,
        NumberRomanPipe,
        NumberThousandSeparatorPipe,
        SafePipe,
        SafeUrlPipe,
        OutlinedComponent,
        ChipSelectorComponent,
        ResourceCounterComponent,
        NumericSliderCounterComponent,
        AmountShifterComponent,
        MarkdownEditorComponent,
        IconComponent,
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
        ClipboardModule,
        ColorPickerModule,
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
        TimePipe,
        DistancePipe,
        MassPipe,
        MissileEndurancePipe,
        AccelerationPipe,
        VelocityPipe,
        TechLevelPipe,
        NumberRomanPipe,
        NumberThousandSeparatorPipe,
        SafePipe,
        SafeUrlPipe,
        OutlinedComponent,
        ChipSelectorComponent,
        MarkdownModule,
        AngularMarkdownEditorModule,
        MaterialComponentsModule,
        NumericCounterComponent,
        NumberShortComponent,
        ResourceCounterComponent,
        NumericSliderCounterComponent,
        AmountShifterComponent,
        MarkdownEditorComponent,
        ClipboardModule,
        ColorPickerModule,
        IconComponent,
    ]
})
export class SharedModuleModule {
}
