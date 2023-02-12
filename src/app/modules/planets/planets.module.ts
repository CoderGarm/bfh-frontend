import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {PlanetSelectionComponent} from "./components/orga/planet-selection/planet-selection.component";
import {PlanetTabViewComponent} from "./components/orga/planet-tab-view/planet-tab-view.component";
import {GroundConstructComponent} from './components/payload/ground-construct/ground-construct.component';
import {PlanetaryJobListComponent} from './components/payload/jobs-list/planetary-job-list.component';
import {ShipyardComponent} from './components/payload/shipyard/shipyard.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {PlanetsEventService} from "./planets-event.service";
import {PlanetaryDashboardComponent} from './components/payload/planetary-dashboard/planetary-dashboard.component';
import {FleetsInOrbitComponent} from './components/payload/fleets-in-orbit/fleets-in-orbit.component';

@NgModule({
    declarations: [
        PlanetSelectionComponent,
        PlanetTabViewComponent,
        GroundConstructComponent,
        PlanetaryJobListComponent,
        ShipyardComponent,
        PlanetaryDashboardComponent,
        FleetsInOrbitComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ],
    providers: [
        PlanetsEventService
    ]
})
export class PlanetsModule {
}
