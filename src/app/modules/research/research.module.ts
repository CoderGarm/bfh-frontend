import {NgModule} from '@angular/core';
import {ResearchTabViewComponent} from "./components/orga/research-tab-view/research-tab-view.component";
import {AvailableResearchesComponent} from "./components/payload/available-researches/available-researches.component";
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TechTreeComponent} from './components/payload/tech-tree/tech-tree.component';
import {ResearchResultOverlayComponent} from './components/payload/research-result-overlay/research-result-overlay.component';


@NgModule({
    declarations: [
        ResearchTabViewComponent,
        AvailableResearchesComponent,
        TechTreeComponent,
        ResearchResultOverlayComponent
    ],
    exports: [
        TechTreeComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class ResearchModule {
}
