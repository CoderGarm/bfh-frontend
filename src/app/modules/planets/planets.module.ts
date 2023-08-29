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
import {FleetsInOrbitComponent} from './components/payload/planetary-dashboard/fleets-in-orbit/fleets-in-orbit.component';
import {PlanetaryMarketplaceComponent} from './components/payload/planetary-marketplace/planetary-marketplace.component';
import {NgxEchartsModule} from "ngx-echarts";
import {OfferMarketComponent} from './components/payload/offer-market/offer-market.component';
import {SpotMarketComponent} from './components/payload/spot-market/spot-market.component';
import {FleetsAtYardComponent} from "./components/payload/shipyard/fleets-at-yard/fleets-at-yard.component";

@NgModule({
    declarations: [
        PlanetSelectionComponent,
        PlanetTabViewComponent,
        GroundConstructComponent,
        PlanetaryJobListComponent,
        ShipyardComponent,
        PlanetaryDashboardComponent,
        FleetsInOrbitComponent,
        FleetsAtYardComponent,
        PlanetaryMarketplaceComponent,
        OfferMarketComponent,
        SpotMarketComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
        NgxEchartsModule
    ],
    providers: [
        PlanetsEventService
    ]
})
export class PlanetsModule {
}
