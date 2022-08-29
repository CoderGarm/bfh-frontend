import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {PlanetsSidenavComponent} from "./components/orga/planets-sidenav/planets-sidenav.component";
import {PlanetSelectionComponent} from "./components/orga/planet-selection/planet-selection.component";
import {PlanetTabViewComponent} from "./components/orga/planet-tab-view/planet-tab-view.component";
import {GroundConstructComponent} from './components/payload/ground-construct/ground-construct.component';
import {JobsListComponent} from './components/payload/jobs-list/jobs-list.component';
import {ShipyardComponent} from './components/payload/shipyard/shipyard.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {PlanetsNotificationService} from "./planets-notification.service";
import {PlanetaryDashboardComponent} from './components/payload/planetary-dashboard/planetary-dashboard.component';

@NgModule({
    declarations: [
        PlanetsSidenavComponent,
        PlanetSelectionComponent,
        PlanetTabViewComponent,
        GroundConstructComponent,
        JobsListComponent,
        ShipyardComponent,
        PlanetaryDashboardComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ],
    providers: [
        PlanetsNotificationService
    ]
})
export class PlanetsModule {
}
