import {NgModule} from '@angular/core';
import {TopicSelectorComponent} from './topic-selector/topic-selector.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TutorialDisplayComponent} from "./components/tutorial-display/tutorial-display.component";
import {TutorialFleetDashComponent} from './topics/journalTabView/fleet-dash/tutorial-fleet-dash.component';
import {TutorialJobDashComponent} from './topics/journalTabView/job-dash/tutorial-job-dash.component';
import {TutorialTradeDashComponent} from './topics/journalTabView/trade-dash/tutorial-trade-dash.component';
import {TutorialInfraDashComponent} from './topics/journalTabView/infra-dash/tutorial-infra-dash.component';
import {TutorialBattleDashComponent} from './topics/journalTabView/battle-dash/tutorial-battle-dash.component';
import {TutorialPlanetDashComponent} from "./topics/planetTabView/dash/tutorial-planet-dash.component";
import {TutorialPlanetConstructionsComponent} from "./topics/planetTabView/constructions/tutorial-planet-constructions.component";
import {TutorialPlanetShipyardComponent} from "./topics/planetTabView/shipyard/tutorial-planet-shipyard.component";
import {TutorialMarketplaceComponent} from "./topics/planetTabView/market/tutorial-marketplace.component";
import {TutorialInnerEmpireTransportationComponent} from './topics/tutorial-inner-empire-transportation/tutorial-inner-empire-transportation.component';
import {TutorialUniverseMapComponent} from './topics/starMapTabView/tutorial-universe-map/tutorial-universe-map.component';
import {TutorialStarMapComponent} from './topics/starMapTabView/tutorial-star-map/tutorial-star-map.component';
import {TutorialMissionComponent} from "./topics/stratOpsTabView/tutorial-star-map/tutorial-mission.component";
import {TutorialColonizationInfoComponent} from './topics/expansionTabView/colonization-info/tutorial-colonization-info.component';
import {TutorialFleetDetachmentComponent} from './topics/fleetTabView/tutorial-fleet-detachment/tutorial-fleet-detachment.component';
import {TutorialCategoryDisplayComponent} from './components/tutorial-category-display/tutorial-category-display.component';
import {WikiModule} from "../wiki/wiki.module";
import {NgxSpinnerModule} from "ngx-spinner";


@NgModule({
    declarations: [
        TopicSelectorComponent,
        TutorialDisplayComponent,
        TutorialFleetDashComponent,
        TutorialJobDashComponent,
        TutorialTradeDashComponent,
        TutorialInfraDashComponent,
        TutorialBattleDashComponent,
        TutorialPlanetDashComponent,
        TutorialPlanetConstructionsComponent,
        TutorialPlanetShipyardComponent,
        TutorialMarketplaceComponent,
        TutorialInnerEmpireTransportationComponent,
        TutorialUniverseMapComponent,
        TutorialStarMapComponent,
        TutorialMissionComponent,
        TutorialColonizationInfoComponent,
        TutorialFleetDetachmentComponent,
        TutorialCategoryDisplayComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
        WikiModule,
        NgxSpinnerModule,
    ]
})
export class TutorialModule {
}
