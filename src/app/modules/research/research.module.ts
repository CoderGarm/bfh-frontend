import {NgModule} from '@angular/core';
import {ResearchViewComponent} from "./components/research-view/research-view.component";
import {AvailableResearchesComponent} from "./components/available-researches/available-researches.component";
import {CompletedResearchesComponent} from "./components/completed-researches/completed-researches.component";
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";


@NgModule({
    declarations: [
        ResearchViewComponent,
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
