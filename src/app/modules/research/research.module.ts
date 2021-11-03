import {NgModule} from '@angular/core';
import {ResearchTabViewComponent} from "./components/orga/research-tab-view/research-tab-view.component";
import {AvailableResearchesComponent} from "./components/payload/available-researches/available-researches.component";
import {CompletedResearchesComponent} from "./components/payload/completed-researches/completed-researches.component";
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";


@NgModule({
    declarations: [
        ResearchTabViewComponent,
        AvailableResearchesComponent,
        CompletedResearchesComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class ResearchModule {
}
