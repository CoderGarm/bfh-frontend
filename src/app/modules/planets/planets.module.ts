import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {PlanetsComponent} from "./components/planets/planets.component";
import {PlanetListComponent} from "./components/planet-list/planet-list.component";
import {PlanetMainComponent} from "./components/planet-main/planet-main.component";
import {GroundConstructComponent} from './components/ground-construct/ground-construct.component';
import {ConstructionDisplayComponent} from './components/construction-display/construction-display.component';
import {JobsListComponent} from './components/jobs-list/jobs-list.component';
import {JobDisplayComponent} from './components/job-display/job-display.component';
import {ShipyardComponent} from './components/shipyard/shipyard.component';
import {ShipClassBuildComponent} from './components/ship-class-build/ship-class-build.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";

@NgModule({
    declarations: [
        PlanetsComponent,
        PlanetListComponent,
        PlanetMainComponent,
        GroundConstructComponent,
        ConstructionDisplayComponent,
        JobsListComponent,
        JobDisplayComponent,
        ShipyardComponent,
        ShipClassBuildComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class PlanetsModule {
}
