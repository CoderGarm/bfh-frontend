import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {AdminTabViewComponent} from './components/orga/admin-tab-view/admin-tab-view.component';
import {TranslationComponent} from './components/payload/translation/translation.component';
import {TranslationEditorComponent} from './components/payload/translation-editor/translation-editor.component';
import {StatisticsComponent} from './components/payload/statistics/statistics.component';


@NgModule({
    declarations: [
        AdminTabViewComponent,
        TranslationComponent,
        TranslationEditorComponent,
        StatisticsComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class AdminModule {
}
